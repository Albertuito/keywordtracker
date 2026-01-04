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

        const { keyword, serpResults, country = 'es' } = await req.json();

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

        // ===== PHASE 1: Strategic Synthesis =====
        const phase1Prompt = `Eres un consultor SEO senior. Analiza estos 10 primeros resultados de Google para la keyword "${keyword}":

${serpSummary}

Preguntas PAA detectadas:
${relatedQuestions.join('\n')}

GENERA UN ANÁLISIS ESTRATÉGICO con:

1. PATRONES OBLIGATORIOS
- ¿Qué temas/secciones aparecen en la MAYORÍA (>50%) de resultados?
- ¿Qué estructura de contenido domina?

2. PATRONES SECUNDARIOS
- ¿Qué enfoques usan solo algunos competidores?

3. HUECOS DE CONTENIDO
- ¿Qué preguntas NO están bien respondidas?
- ¿Qué información falta o está superficial?
- ¿Qué podríamos hacer mejor?

4. INTENCIÓN REAL DE LA SERP
- ¿Informacional, comercial, transaccional o mixta?
- ¿Qué busca realmente el usuario?

5. TIPO DE CONTENIDO GANADOR
- ¿Qué tipo de página tiene más probabilidades de rankear? (guía, comparativa, tutorial, landing, etc.)

Responde en JSON estructurado.`;

        const phase1Result = await callGPT(phase1Prompt, 2000);

        // ===== PHASE 2: Editorial Decision =====
        const phase2Prompt = `Basándote en este análisis del TOP 10 para "${keyword}":

${phase1Result}

DECIDE la estrategia de contenido:

1. TIPO DE CONTENIDO ÓPTIMO
(guía completa, comparativa, tutorial paso a paso, landing informativa, híbrido, etc.)

2. ESTRUCTURA PROPUESTA
- H1 propuesto
- Lista de H2 principales (6-10)
- H3 sugeridos bajo cada H2

3. NIVEL DE PROFUNDIDAD
- Longitud objetivo (palabras)
- Nivel de detalle necesario

4. QUÉ NO INCLUIR
- ¿Qué hacen los competidores que NO deberíamos copiar?

5. DIFERENCIACIÓN
- ¿Cómo superamos al TOP 10?

Responde en JSON estructurado.`;

        const phase2Result = await callGPT(phase2Prompt, 1500);

        // ===== PHASE 3: Content Generation =====
        const phase3Prompt = `Eres un redactor experto en la materia. Genera el contenido completo para posicionar la keyword "${keyword}" en ${country === 'es' ? 'España' : country}.

ESTRATEGIA A SEGUIR:
${phase2Result}

REGLAS ABSOLUTAS:
1. Escribe como un EXPERTO HUMANO, no como IA
2. NUNCA menciones SEO, keywords, optimización ni posicionamiento
3. Usa lenguaje natural, preciso y directo
4. Profundiza más que los competidores
5. Responde TODAS las dudas que un usuario real tendría
6. Incluye ejemplos concretos cuando aplique
7. NO uses frases genéricas ni relleno
8. El contenido debe ser ÚTIL y ACCIONABLE
9. Incluye una sección de FAQs al final

FORMATO:
- Usa Markdown (## para H2, ### para H3)
- Incluye listas donde mejore la claridad
- NO incluyas introducción genérica tipo "En este artículo..."

GENERA EL CONTENIDO COMPLETO:`;

        const generatedContent = await callGPT(phase3Prompt, 8000);

        // ===== PHASE 4: Self-Evaluation =====
        const phase4Prompt = `Evalúa este contenido generado para la keyword "${keyword}":

${generatedContent.substring(0, 3000)}...

VERIFICACIÓN:
1. ¿Cubre todo lo que cubren los TOP 10?
2. ¿Responde las dudas principales mejor que ellos?
3. ¿Aporta valor adicional real?
4. ¿Parece escrito por un experto humano?
5. ¿Hay frases genéricas de IA que debas señalar?

Responde:
- APROBADO si el contenido es competitivo
- MEJORABLE si hay problemas menores (y cuáles)
- RECHAZADO si hay problemas graves (y cuáles)`;

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
