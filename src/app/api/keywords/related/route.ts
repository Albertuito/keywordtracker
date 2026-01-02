import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';
import { OpenAIService } from '@/lib/openai';
import { deductBalance } from '@/lib/balance';
import { PRICING } from '@/lib/pricing';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log('[Related Keywords API] Starting...');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.log('[Related Keywords API] Unauthorized - no session');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { keyword, country = 'es', limit = 50, projectId } = body;
        console.log('[Related Keywords API] Request:', { keyword, country, limit, projectId });

        if (!keyword || typeof keyword !== 'string') {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // Deduct balance first
        const cost = PRICING.related_keywords;
        console.log('[Related Keywords API] Deducting balance:', cost);

        const deductResult = await deductBalance({
            userId: session.user.id,
            action: 'related_keywords',
            metadata: { keyword }
        });

        if (!deductResult.success) {
            console.log('[Related Keywords API] Balance deduction failed:', deductResult.error);
            return NextResponse.json({
                error: deductResult.error || 'Saldo insuficiente',
                required: cost
            }, { status: 402 });
        }

        console.log('[Related Keywords API] Balance deducted. Fetching keywords...');

        // Fetch keyword ideas from DataForSEO Labs (better quality)
        const keywords = await DataForSEO.getKeywordIdeas(keyword, country, limit);

        console.log('[Related Keywords API] DataForSEO response:', keywords ? `${keywords.length} keywords` : 'null');

        if (!keywords || keywords.length === 0) {
            console.log('[Related Keywords API] No keywords found from DataForSEO');
            return NextResponse.json({
                error: 'No se encontraron keywords relacionadas. Intenta con otra keyword.',
                keyword,
                refunded: false
            }, { status: 404 });
        }

        console.log('[Related Keywords API] Running GPT analysis...');

        // Analyze keywords with GPT for actionable recommendations
        const analysis = await OpenAIService.analyzeKeywordIdeas(keyword, keywords);

        console.log('[Related Keywords API] Analysis complete. Saving report...');

        // Save report to database
        const report = await prisma.keywordReport.create({
            data: {
                userId: session.user.id,
                projectId: projectId || null,
                seedKeyword: keyword,
                keywords: keywords as any,
                analysis: analysis as any,
                country
            }
        });

        console.log('[Related Keywords API] Report saved:', report.id);

        return NextResponse.json({
            success: true,
            reportId: report.id,
            keyword,
            keywords,
            analysis,
            count: keywords.length,
            cost,
            newBalance: deductResult.newBalance
        });

    } catch (error: any) {
        console.error('[Related Keywords API] Error:', error.message, error.stack);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message
        }, { status: 500 });
    }
}
