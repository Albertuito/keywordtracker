import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const COST_PER_GENERATION = 0.50; // €0.50 per article

interface SerpResult {
    position: number;
    url: string;
    domain: string;
    title: string;
    description: string;
    breadcrumb?: string;
    is_featured_snippet?: boolean;
    faq?: string[];
    related_questions?: string[];
}

async function callGPT(prompt: string, maxTokens: number = 4000): Promise<string> {
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.7,
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.choices[0].message.content;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { keyword, serpResults, country = 'es', averageWordCount = 1500 } = await req.json();

        if (!keyword || !serpResults || serpResults.length === 0) {
            return NextResponse.json({ error: 'Keyword y resultados SERP requeridos' }, { status: 400 });
        }

        // Check user balance
        const userBalance = await prisma.userBalance.findUnique({
            where: { userId: session.user.id }
        });

        if (!userBalance || userBalance.balance < COST_PER_GENERATION) {
            return NextResponse.json({
                error: `Saldo insuficiente. Necesitas €${COST_PER_GENERATION} para generar contenido. Tu saldo: €${userBalance?.balance?.toFixed(2) || '0.00'}`
            }, { status: 402 });
        }

        // Format SERP data for analysis
        const serpSummary = serpResults.map((r: SerpResult) => `
#${r.position}: ${r.title}
URL: ${r.url}
Descripción: ${r.description}
${r.faq?.length ? `FAQs: ${r.faq.join(', ')}` : ''}
`).join('\n---\n');

        const relatedQuestions = serpResults
            .flatMap((r: SerpResult) => r.related_questions || [])
            .filter((q: string, i: number, arr: string[]) => arr.indexOf(q) === i)
            .slice(0, 10);

        // ===== FASE 1: Síntesis Estratégica (Análisis SERP) =====
        const phase1Prompt = `PROMPT MAESTRO SEO AVANZADO (MULTITEMÁTICO)
FASE 1: Síntesis Estratégica (Análisis SERP)

Objetivo: entender qué está premiando Google HOY y qué espera realmente el usuario.

Eres un consultor SEO senior con experiencia real en posicionamiento competitivo.

Analiza los 10 primeros resultados de Google para la keyword "${keyword}" en ${country === 'es' ? 'España' : country}:

Resumen del SERP:
${serpSummary}

Preguntas PAA detectadas:
${relatedQuestions.join('\n')}

GENERA UN ANÁLISIS ESTRATÉGICO en JSON con:
1. PATRONES OBLIGATORIOS
- Temas y secciones que aparecen en más del 50% de los resultados.
- Tipo de contenido dominante (guía, comparativa, landing, tutorial, híbrido).
- Nivel de profundidad real (superficial / medio / experto).

2. HUECOS DE CONTENIDO
- Preguntas mal respondidas o tratadas de forma superficial.
- Información clave que el usuario necesita para decidir y que falta.
- Oportunidades para aportar: ejemplos reales, datos concretos, comparativas, criterios de decisión.

3. INTENCIÓN REAL DE LA SERP
- Clasifica la intención como: Informacional, Comercial, Transaccional, Mixta.
- Explica qué acción quiere realizar el usuario tras leer el contenido.`;

        const phase1Result = await callGPT(phase1Prompt, 2000);

        // ===== FASE 2: Decisión Editorial (Estrategia de Ataque) =====
        const phase2Prompt = `FASE 2: Decisión Editorial (Estrategia de Ataque)

Objetivo: definir cómo superar al TOP 10, no igualarlo.

Basándote en el análisis anterior para "${keyword}":
${phase1Result}

Media de palabras del TOP 10: ${averageWordCount}

DEFINE LA ESTRATEGIA en JSON:
1. TIPO DE CONTENIDO ÓPTIMO
(Guía profunda, comparativa decisional, tutorial paso a paso, landing híbrida, contenido de autoridad, etc.)

2. ESTRUCTURA PROPUESTA
- H1 (atractivo, natural y con keyword)
- H2 principales (6–10, orientados a intención y decisión)
- H3 por cada H2, solo si aportan valor real

3. LONGITUD OBJETIVO
- Objetivo: ${Math.round(averageWordCount * 1.1)} palabras
- Justifica si conviene superar más la media por complejidad del tema.

4. ENFOQUE DIFERENCIAL OBLIGATORIO
Define explícitamente:
- Qué vamos a explicar mejor que el TOP 10.
- Qué vamos a explicar con más claridad.
- Qué vamos a explicar con ejemplos, datos o tablas.
- Qué errores comunes vamos a desmontar.`;

        const phase2Result = await callGPT(phase2Prompt, 1500);

        // ===== FASE 3: Generación de Contenido (Redacción SEO que Posiciona) =====
        const phase3Prompt = `FASE 3: Generación de Contenido (Redacción SEO que Posiciona)

Eres un experto real en la temática, escribes como alguien que trabaja con esto en el día a día, no como un redactor genérico.

Genera el contenido completo para posicionar "${keyword}" en ${country === 'es' ? 'España' : country}, siguiendo estrictamente esta estrategia:
${phase2Result}

REGLAS DE ORO DE REDACCIÓN (CRÍTICO)

TONO HUMANO Y EXPERTO
- Escribe como un profesional con experiencia real.
- Frases naturales, claras y seguras.
- Evita frases vacías o académicas.

RESOLUCIÓN DE INTENCIÓN
- Cada sección debe ayudar al usuario a: entender, comparar, decidir, actuar.
- No rellenes texto: cada párrafo debe aportar algo útil.

E-E-A-T FORZADO
- Integra de forma natural: experiencia práctica, advertencias reales, matices ("depende de...", "en la práctica ocurre que..."), referencias a normativa, contexto o mercado cuando aplique.

NEGRITAS ESTRATÉGICAS
- Usa negrita para: keywords principales, conceptos clave, datos importantes.
- Nunca abuses (máx. 10–15% del texto).

FORMATO
- Markdown limpio
- H1, H2, H3
- Listas, tablas y bloques comparativos si aportan claridad
- NO introducciones genéricas tipo "En este artículo..."

SIN CONCLUSIÓN ARTIFICIAL
- NO escribas "Conclusión", "Resumen" o "En definitiva".
- Termina con: un CTA natural, una reflexión práctica, o el siguiente paso lógico del usuario.

PRECISIÓN
- Evita afirmaciones absolutas.
- Matiza siempre cuando algo depende del contexto.

👉 Empieza directamente con el H1.`;

        const generatedContent = await callGPT(phase3Prompt, 8000);

        // ===== FASE 4: Autoevaluación Crítica (Control de Calidad) =====
        const phase4Prompt = `FASE 4: Autoevaluación Crítica (Control de Calidad)

Evalúa el contenido generado para "${keyword}":
${generatedContent.substring(0, 5000)}...

VERIFICACIÓN FINAL
Responde con una valoración clara:
1. ¿Cubre TODO lo que cubre el TOP 10?
2. ¿Resuelve mejor la intención real del usuario?
3. ¿Aporta ejemplos, datos o criterios prácticos?
4. ¿Parece escrito por un experto humano?
5. Señala frases genéricas o mejorables si existen.

RESULTADO FINAL
- APROBADO → contenido listo para competir
- MEJORABLE → indica ajustes concretos
- RECHAZADO → explica fallos graves`;

        const qualityCheck = await callGPT(phase4Prompt, 500);

        const balanceBefore = userBalance.balance;
        const balanceAfter = balanceBefore - COST_PER_GENERATION;
        const wordCount = generatedContent.split(/\s+/).filter((w: string) => w.length > 0).length;

        // Deduct balance, log transaction, and save content atomically
        const [, , savedContent] = await prisma.$transaction([
            prisma.userBalance.update({
                where: { userId: session.user.id },
                data: {
                    balance: balanceAfter,
                    totalSpent: { increment: COST_PER_GENERATION }
                }
            }),
            prisma.balanceTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: -COST_PER_GENERATION,
                    type: 'content_generation',
                    description: `Ingeniería Inversa SEO: "${keyword}"`,
                    balanceBefore,
                    balanceAfter,
                    metadata: JSON.stringify({ keyword, country })
                }
            }),
            prisma.generatedContent.create({
                data: {
                    userId: session.user.id,
                    keyword,
                    country,
                    content: generatedContent,
                    wordCount,
                    cost: COST_PER_GENERATION
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            keyword,
            content: generatedContent,
            contentId: savedContent.id,
            cost: COST_PER_GENERATION,
            generatedAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Content Generation Error:', error);
        return NextResponse.json({
            error: error.message || 'Error al generar contenido'
        }, { status: 500 });
    }
}
