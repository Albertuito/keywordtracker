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
   * Analyze keyword ideas and provide actionable SEO recommendations
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
    url_keywords: string[];
    title_keywords: string[];
    h2_keywords: string[];
    faq_questions: string[];
    content_gaps: string[];
    priority_ranking: Array<{ keyword: string; reason: string; priority: 'high' | 'medium' | 'low' }>;
    summary: string;
  }> {
    if (!this.apiKey) throw new Error("OpenAI API Key missing");

    const prompt = `
Eres un consultor SEO senior con enfoque en negocio y conversión.
Tu trabajo NO es listar keywords, sino decidir estratégicamente cuáles usar y por qué.

Analiza las siguientes keywords relacionadas con "${seedKeyword}".
Cada keyword incluye datos cuantitativos, pero debes usar tu criterio profesional para:
- Identificar su intención REAL (aunque difiera del campo intent)
- Evaluar su valor SEO y de negocio
- Priorizar oportunidades accionables

KEYWORDS:
${JSON.stringify(keywords.slice(0, 30), null, 2)}

CRITERIOS DE DECISIÓN (OBLIGATORIOS):
- Prioriza keywords con intención comercial o transaccional REAL
- Valora alto volumen + dificultad razonable, pero acepta excepciones si el valor de negocio es alto
- Usa las informacionales solo si apoyan conversión, autoridad o FAQs
- Evita keywords ambiguas, irrelevantes o sin potencial de conversión
- No fuerces resultados si los datos no lo justifican

REGLAS DE CALIDAD:
- No repitas la misma keyword en diferentes secciones
- No inventes keywords ni preguntas
- Si no hay suficientes oportunidades de calidad, reduce el número de resultados
- Justifica implícitamente cada selección (sin explicaciones externas)

GENERA UN ÚNICO JSON CON:

1. url_keywords:
   - 2-3 keywords principales ideales para el slug
   - Deben representar el core del negocio y la intención principal

2. title_keywords:
   - 2-3 keywords óptimas para Title Tag / H1
   - Orientadas a captar tráfico con intención de compra o contratación

3. h2_keywords:
   - 5-7 keywords secundarias y variaciones semánticas
   - Útiles para estructurar el contenido y ampliar cobertura SEO

4. faq_questions:
   - 5-8 preguntas basadas en dudas reales del usuario
   - Derivadas de keywords informacionales relevantes
   - Enfocadas a reducir fricción y objeciones de conversión

5. content_gaps:
   - 3-5 oportunidades de contenido NO cubiertas directamente por keywords principales
   - Enfocadas a autoridad, confianza o captación de tráfico cualificado
   - Indica implícitamente su valor estratégico

6. priority_ranking:
   - Las 5 mejores oportunidades SEO ordenadas por prioridad real
   - Para cada una incluye:
     - keyword
     - intent_detected (informational / commercial / transactional)
     - volume
     - difficulty
     - reason (por qué merece ser priorizada desde un punto de vista SEO y de negocio)
     - priority (high / medium / low)

7. summary:
   - Resumen ejecutivo de la estrategia recomendada
   - Enfocado a impacto de negocio, no a métricas
   - Máximo 3 frases, tono consultivo

FORMATO:
- Responde SOLO con JSON válido
- No incluyas explicaciones, introducciones ni texto adicional
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
        url_keywords: [],
        title_keywords: [],
        h2_keywords: [],
        faq_questions: [],
        content_gaps: [],
        priority_ranking: [],
        summary: "No se pudo generar el análisis IA."
      };
    }
  }
}
