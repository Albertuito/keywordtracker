import axios from 'axios';

export class OpenAIService {
  private static apiKey = process.env.OPENAI_API_KEY;
  private static baseUrl = 'https://api.openai.com/v1/chat/completions';

  static async analyzeSEO(
    technicalData: any,
    keyword: string,
    competitors: any[] = [],
    pageContent: string = "",
    keywordData: any = null,
    relatedKeywords: any[] = []
  ) {
    if (!this.apiKey) throw new Error("OpenAI API Key missing");

    const domain = technicalData.url ? new URL(technicalData.url).hostname : 'web.es';
    const clientSlug = technicalData.url ? new URL(technicalData.url).pathname.split('/').filter(Boolean).pop() || 'index' : 'index';

    // Word count: DataForSEO usa meta.content.plain_text_word_count
    const dfWordCount = technicalData.meta?.content?.plain_text_word_count || technicalData.meta?.content_info?.word_count || 0;
    const manualWordCount = pageContent.split(/\\s+/).filter((w: string) => w.length > 0).length;
    const finalWordCount = dfWordCount || manualWordCount;

    // Imágenes sin ALT: usar datos técnicos de DataForSEO
    const imagesCount = technicalData.meta?.images_count || 0;
    const noAltImagesFlag = technicalData.checks?.no_image_alt || false;

    const prompt = `
Actúa como Consultor SEO Senior + Estratega de Contenidos.
Debes generar una auditoría exhaustiva EN ESPAÑOL para una URL y su keyword objetivo, comparándola con el TOP 5 orgánico de Google.
Trabaja solo con los datos proporcionados. No inventes métricas ni elementos.

CONTEXTO
- KEYWORD OBJETIVO: ${keyword}
- DOMINIO DEL CLIENTE: ${domain}
- URL DEL CLIENTE: ${technicalData.url || 'N/A'}

KEYWORD INTELLIGENCE (DataForSEO v3.2):
- Volumen de búsqueda mensual: ${keywordData?.search_volume || 'No disponible'}
- CPC medio: $${keywordData?.cpc?.toFixed(2) || '0.00'}
- Competencia (0-1): ${keywordData?.competition || 'No disponible'}
- KEYWORDS RELACIONADAS (Long-tails y oportunidades):
${JSON.stringify(relatedKeywords.slice(0, 15).map((k: any) => ({
      keyword: k.keyword,
      volume: k.keyword_info?.search_volume || k.search_volume || 0,
      difficulty: k.keyword_properties?.keyword_difficulty || 'N/A',
      intent: k.keyword_properties?.search_intent?.[0] || 'informational'
    })), null, 2)}


DATOS DEL CLIENTE (de DataForSEO instant_pages)
- meta.title: ${technicalData.meta?.title || 'No detectado'}
- meta.description: ${technicalData.meta?.description || 'No detectado'}
- H1s (array): ${JSON.stringify(technicalData.meta?.htags?.h1 || [])}
- onpage_score: ${technicalData.onpage_score || 0}
- Word count (DataForSEO): ${dfWordCount}
- Word count (manual desde texto extraído): ${manualWordCount}
- Imágenes totales: ${imagesCount}
- ¿Hay imágenes sin ALT?: ${noAltImagesFlag ? 'SÍ, DETECTADAS' : 'No detectadas'}
- Checks técnicos: ${JSON.stringify(technicalData.checks || {})}
- page_timing: ${JSON.stringify(technicalData.page_timing || {})}
- CMS/Generator detectado: ${technicalData.meta?.generator || 'No detectado'}
- Canonical: ${technicalData.meta?.canonical || 'No definido'}
- Charset: ${technicalData.meta?.charset || 65001}
- duplicate_meta_tags: ${JSON.stringify(technicalData.meta?.duplicate_meta_tags || [])}
- deprecated_tags: ${JSON.stringify(technicalData.meta?.deprecated_tags || [])}

DATOS DE INFRAESTRUCTURA (para checkpoints):
- status_code: ${technicalData.status_code || 200}
- url: ${technicalData.url || 'N/A'}
- is_https: ${technicalData.url?.startsWith('https') ? 'SÍ' : 'NO'}
- content_encoding (compresión): ${technicalData.content_encoding || 'No detectado'}
- server: ${technicalData.server || 'No detectado'}
- cache_control: ${technicalData.cache_control || 'No configurado'}
- download_time_ms: ${technicalData.page_timing?.download_time || 0}
- time_to_interactive_ms: ${technicalData.page_timing?.time_to_interactive || 0}
- enlaces_internos: ${technicalData.meta?.internal_links_count || 0}
- enlaces_externos: ${technicalData.meta?.external_links_count || 0}
- total_dom_size: ${technicalData.total_dom_size || 0}
- broken_resources: ${technicalData.broken_resources ? 'SÍ' : 'NO'}
- broken_links: ${technicalData.broken_links ? 'SÍ' : 'NO'}

- CONTENIDO TEXTO CLIENTE (fragmento extraído por content_parsing): ${pageContent.substring(0, 12000) || 'NO_CONTENT'}

TOP 5 COMPETIDORES (Ingeniería Inversa Profunda v3.1):
${JSON.stringify(competitors.map((c, i) => ({
      rank: c.rank || i + 1,
      url: c.url,
      serp_title: c.title,
      serp_description: c.description,
      // Datos técnicos extraídos de cada competidor
      word_count: c.word_count || 0,
      h1s: c.h1s || [],
      h2s: c.h2s || [],
      h3s: c.h3s || [],
      meta_title_real: c.meta_title || c.title,
      meta_description_real: c.meta_description || c.description,
      generator_cms: c.generator || 'No detectado',
      onpage_score: c.onpage_score || 0,
      images_count: c.images_count || 0,
      internal_links: c.internal_links || 0,
      external_links: c.external_links || 0
    })), null, 2)}

OBJETIVO:
1. Auditar metadatos, contenido, técnico, imágenes/ALT y CMS del cliente.
2. Desmontar el Top 5: 
   - Calcular media_palabras REAL sumando word_count de los 5 competidores y dividiendo.
   - Extraer patrones de H2s analizando los H2s de cada competidor para encontrar secciones comunes.
   - Identificar keywords/entidades que aparecen en H1s/H2s de competidores pero NO en el cliente.
3. Construir un plan de superación: Keyword gap basado en datos REALES, Outline recomendado, y Brief para superar al Top 5.

REGLAS CRÍTICAS PARA KEYWORD GAP v3.2:
- Para missing_terms_primary: Extrae términos de los H2s de competidores que el cliente NO tiene. 
- Para missing_terms_secondary: USA LAS KEYWORDS RELACIONADAS proporcionadas en "KEYWORD INTELLIGENCE". Filtra las que tengan mayor volumen y dificultad baja/media. Son LONG-TAILS REALES de DataForSEO.
- Para entities_topics_missing: Extrae entidades y tópicos de las keywords relacionadas proporcionadas (sustantivos, categorías, conceptos) que el cliente debería cubrir.
- Usa los datos REALES de word_count de cada competidor para calcular media_palabras.
- Analiza los H1s, H2s y H3s de competidores para encontrar patrones de estructura.
- Para patrones_top5.titles, analiza los meta_title_real de competidores.
- Para patrones_top5.slugs, analiza las URLs de competidores.
- Si "¿Hay imágenes sin ALT?" dice "SÍ, DETECTADAS", incluye UNA entrada genérica en sin_alt_detectadas.
- Para CMS: Si meta.generator tiene valor, úsalo. Si no, pon "No detectado".

REGLAS CRÍTICAS PARA CHECKPOINTS DE INFRAESTRUCTURA (tecnico.detalles):
Genera EXACTAMENTE estos checkpoints usando los datos de infraestructura proporcionados:
1. "Redirección HTTPS" - estado: ok si is_https=SÍ, fail si es NO. Evidence: la URL. Solución si falta HTTPS.
2. "Tiempo de Respuesta" - estado: ok si download_time_ms < 400, fail si > 400. Evidence: el tiempo en ms. Solución: optimizar WPO.
3. "Compresión GZip/Brotli" - estado: ok si content_encoding tiene gzip o br, fail si no. Evidence: el encoding. Solución: activar compresión.
4. "Enlaces Internos" - estado: ok si enlaces_internos >= 3, fail si < 3. Evidence: cantidad. Solución: añadir enlaces internos.
5. "Enlaces Externos" - estado: ok si enlaces_externos >= 1, fail si = 0. Evidence: cantidad. Solución: añadir autoridad con enlaces a fuentes.
6. "Recursos Rotos" - estado: ok si broken_resources=NO, fail si SÍ. Evidence: estado. Solución: corregir recursos.
7. "Canonical Correcto" - estado: ok si canonical está definido, fail si no. Evidence: el canonical o "No definido". Solución: añadir etiqueta canonical.
- Responde SOLO JSON VÁLIDO.

FORMATO DE RESPUESTA JSON:
{
  "score": 0,
  "summary": "",
  "urgency_level": "Urgente|Necesita Mejora|Optimizado",
  "client": {
    "url": "${technicalData.url}",
    "slug_actual": "${clientSlug}",
    "slug_status": "Urgente|Corrección|Optimizado|unknown",
    "slug_recomendado": "",
    "justificacion_slug": ""
  },
  "sections": {
    "metadatos": {
      "status": "Urgente|Optimizado|Corrección",
      "title": { "actual": "", "recomendado": "", "longitud_actual": 0, "longitud_recomendada": 0, "incluye_keyword": true },
      "description": { "actual": "", "recomendado": "", "longitud_actual": 0, "longitud_recomendada": 0 },
      "h1": { "actual": [], "propuesta": "" }
    },
    "competencia": {
      "status": "Urgente|Optimizado|Corrección",
      "comparacion": [
        { "rank": 0, "url": "", "palabras": 0, "ventaja": "", "debilidad": "" }
      ],
      "patrones_top5": {
        "slugs": { "pattern": "", "examples": [] },
        "titles": { "pattern": "", "examples": [] },
        "profundidad": { "media_palabras": 0, "objetivo": 0 }
      },
      "gap_analisis": ""
    },
    "keyword_gap": {
      "status": "Urgente|Corrección|Optimizado",
      "missing_terms_primary": [
        { "term": "", "why_it_matters": "", "where_to_add": "", "priority": "high|medium|low" }
      ],
      "missing_terms_secondary": [
        { "term": "keyword relacionada real de KEYWORD INTELLIGENCE", "volume": 0, "difficulty": 0, "intent": "informational|commercial|transactional", "priority": "high|medium|low" }
      ],
      "entities_topics_missing": [
        { "entity": "entidad/tema extraído de keywords relacionadas", "relevance": "alta|media|baja", "suggested_section": "Dónde añadirlo (H2/párrafo)" }
      ]
    },
    "contenido": {
      "status": "Urgente|Optimizado|Corrección",
      "word_count_cliente": ${finalWordCount},
      "word_count_objetivo": 0,
      "highlighted_text": "",
      "outline_recomendado": {
        "h1": "",
        "h2_h3": [ { "h2": "", "h3": [""] } ]
      },
      "sugerencias_editoriales": [ { "accion": "", "detalle": "", "priority": "high|medium|low" } ],
      "brief_superacion": { "que_anadir": [], "faq_recomendadas": [] }
    },
    "imagenes": {
      "status": "Urgente|Optimizado|Corrección",
      "sin_alt_detectadas": [ { "src": "", "alt_actual": "", "alt_recomendado": "" } ]
    },
    "tecnico": {
      "status": "Urgente|Optimizado|Corrección",
      "detalles": [ { "item": "", "estado": "ok|fail", "evidence": "", "solucion": "" } ],
      "velocidad": { "download_time": 0, "diagnostico": "", "acciones_wpo": [] },
      "cms_info": { "tipo": "", "plugins_detectados": [], "recomendaciones_especificas": [] }
    }
  }
}
`;

    try {
      const response = await axios.post(this.baseUrl, {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Eres el Consultor SEO #1 del mundo. Tu misión es dar soluciones exactas basándote en ingeniería inversa de la competencia. Responde siempre en JSON y en ESPAÑOL." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      console.error('OpenAI Analysis Error:', error.response?.data || error.message);
      throw new Error("Error en el análisis estratégico de I.A.");
    }
  }

  /**
   * Get semantic synonyms and alternative search terms for a keyword
   * Uses GPT-4o-mini for speed and cost efficiency
   */
  static async getKeywordSynonyms(keyword: string): Promise<string[]> {
    if (!this.apiKey) return [keyword]; // Fallback to original keyword

    try {
      const response = await axios.post(this.baseUrl, {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en SEO y búsqueda semántica. Tu tarea es generar sinónimos y formas alternativas en las que los usuarios buscarían un servicio/producto. Responde SOLO con un array JSON de strings, sin explicaciones."
          },
          {
            role: "user",
            content: `Para la keyword "${keyword}", genera 10-15 formas alternativas en las que los usuarios podrían buscar este servicio/producto en Google.

Incluye:
- Sinónimos directos (ej: "asesor" → "consultor", "broker", "intermediario")
- Variaciones con la misma raíz semántica
- Términos del mismo campo semántico que representen el MISMO servicio

NO incluyas:
- Productos o servicios DIFERENTES aunque estén relacionados temáticamente
- Long-tails genéricos del sector
- Términos que no sean intercambiables con la keyword original

Ejemplo para "asesor hipotecario":
✅ "broker hipotecario", "consultor hipotecas", "intermediario hipotecas", "gestor hipotecario"
❌ "hipoteca joven", "simulador hipoteca" (son servicios/productos diferentes)

Responde con un array JSON de las raíces/términos clave que deben coincidir:`
          }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = JSON.parse(response.data.choices[0].message.content);
      // Handle various response formats
      const synonyms = result.synonyms || result.keywords || result.terms || result.alternatives || [];
      console.log(`[OpenAI] Synonyms for "${keyword}":`, synonyms);
      return Array.isArray(synonyms) ? synonyms : [keyword];
    } catch (error: any) {
      console.error('OpenAI Synonyms Error:', error.response?.data || error.message);
      return [keyword]; // Fallback to original keyword
    }
  }

  /**
   * Analyze keyword ideas and provide actionable SEO recommendations for existing URLs
   */
  static async analyzeKeywordIdeas(
    seedKeyword: string,
    keywords: Array<{
      keyword: string;
      volume: number;
      difficulty: number;
      intent: string;
      cpc: number;
    }>
  ): Promise<{
    page_type_detection: {
      detected_type: string;
      confidence: number;
      dominant_intent: string;
      key_signal: string;
    };
    alignment_check: {
      is_aligned: boolean;
      risk_if_unchanged: string;
      opportunity_if_fixed: string;
    };
    quick_wins: string[];
    optimized_recommendations: {
      title_adjustment: string;
      h1_adjustment: string;
      h2_structure: string[];
      meta_description: string;
      faq_strategy: string[];
    };
    keyword_usage_strategy: {
      primary_keywords: string[];
      supporting_keywords: string[];
      keywords_to_exclude: Array<{ keyword: string; reason: string }>;
    };
    summary: string;
  }> {
    if (!this.apiKey) throw new Error("OpenAI API Key missing");

    const prompt = `
Eres un Experto SEO Técnico y Estratega de Contenidos Senior.
Tu objetivo es analizar una lista de keywords para optimizar una URL específica enfocada en "${seedKeyword}".
Responde SIEMPRE en español.

CONTEXTO:
- Keyword Semilla (Foco): "${seedKeyword}"
- Objetivo: Encontrar keywords ALTAMENTE RELEVANTES semánticamente para enriquecer el contenido, no para canibalizarlo ni cambiar de tema.

PASO 1 – Filtrado Estricto & Diagnóstico:
- Analiza la lista de keywords proporcionada.
- DETECTA y DESCARTA keywords que sean:
  1. Tráfico "Broad" demasiado genérico (ej: si el foco es "hipoteca fija", "hipoteca" es demasiado genérico).
  2. Servicios/Productos diferentes (ej: si es "hipoteca", "préstamo coche" o "jubilación" son TÓXICAS).
  3. Intenciones mixtas incompatibles.
- Identifica el "Page Type" ideal para "${seedKeyword}".

PASO 2 – Selección de Keywords (The Semrush Approach):
- Primary Keywords: Variaciones muy cercanas a la seed keyword (sinónimos directos, orden de palabras).
- Supporting Keywords: Long-tails ESPECÍFICOS que añaden profundidad (ej: con "requisitos", "mejores", "simulador", "interés").
- DEBEN SER SEMÁNTICAMENTE HIJAS de la keyword semilla. NO primas lejanas.

KEYWORDS DISPONIBLES (con métricas):
${JSON.stringify(keywords.slice(0, 40).map(k => ({
      keyword: k.keyword,
      volume: k.volume,
      difficulty: k.difficulty,
      intent: k.intent
    })), null, 2)}

GENERA UN JSON CON ESTA ESTRUCTURA EXACTA:

1. page_type_detection:
   - detected_type: string (blog | service | category | tool | product)
   - confidence: number (0–1)
   - dominant_intent: string
   - key_signal: string

2. alignment_check:
   - is_aligned: boolean
   - risk_if_unchanged: string
   - opportunity_if_fixed: string

3. quick_wins:
   - Array de 3 strings con acciones SEO concretas (ej: "Incluir 'mejores' en H1", "Atacar la pregunta X en FAQ").

4. optimized_recommendations:
   - title_adjustment: string (Title Tag optimizado, incluye seed kw, máx 60 chars)
   - h1_adjustment: string (H1 potente y descriptivo)
   - h2_structure: array de 4-6 H2s lógicos que cubran la intención de búsqueda.
   - meta_description: string (Optimized CTA, máx 155 chars)
   - faq_strategy: array de 3-5 preguntas comunes REALES de los usuarios.

5. keyword_usage_strategy:
   - primary_keywords: Array [3-5] keywords. La seed + variaciones exactas/sinónimos directos.
   - supporting_keywords: Array [5-10] keywords. SOLO Long-tails estrictamente relacionados. NADA genérico. (Ej para "hipoteca sin vinculaciones": "hipotecas sin nomina", "hipoteca fija sin productos", "mejores hipotecas sin vinculacion").
   - keywords_to_exclude: Array [{ keyword, reason }] de términos que aparezcan en la lista pero sean irrelevantes/tóxicos (ej: competencia directa de marca, productos distintos).

6. summary: string (Resumen ejecutivo corto).

REGLAS DE ORO:
- **VOLUMEN ES REY:** Solo recomienda keywords con volumen > 0 (idealmente > 10). Si tiene 0 búsquedas, ignórala salvo que sea una oportunidad emergente crítica.
- **NO INVENTES:** Selecciona SOLO de la lista "KEYWORDS DISPONIBLES". No te inventes keywords que no estén ahí con datos reales.
- Si la keyword lista tiene basura (ej: "jubilación"), MÁNDALA A keywords_to_exclude.
- NO sugieras "comparador genérico" si la seed es un producto específico.
- Mantén el foco en la intención de "${seedKeyword}".
`;

    try {
      const response = await axios.post(this.baseUrl, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un consultor SEO experto. Responde siempre en JSON válido y en ESPAÑOL." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      console.error('OpenAI Keyword Analysis Error:', error.response?.data || error.message);
      // Return default structure on error
      return {
        page_type_detection: {
          detected_type: 'unknown',
          confidence: 0,
          dominant_intent: 'unknown',
          key_signal: ''
        },
        alignment_check: {
          is_aligned: true,
          risk_if_unchanged: 'No se pudo analizar',
          opportunity_if_fixed: 'No disponible'
        },
        quick_wins: [],
        optimized_recommendations: {
          title_adjustment: '',
          h1_adjustment: '',
          h2_structure: [],
          meta_description: '',
          faq_strategy: []
        },
        keyword_usage_strategy: {
          primary_keywords: [],
          supporting_keywords: [],
          keywords_to_exclude: []
        },
        summary: "No se pudo generar el análisis IA."
      };
    }
  }
}
