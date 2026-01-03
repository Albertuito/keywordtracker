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

        // Hybrid Discovery: Run DataForSEO and AI Generation in Parallel
        console.log('[Related Keywords API] Running Hybrid Discovery (DataForSEO + AI)...');

        const [dfsKeywords, aiSuggestions] = await Promise.all([
            DataForSEO.getKeywordIdeas(keyword, country, limit),
            OpenAIService.generateLongTails(keyword)
        ]);

        console.log(`[Related Keywords API] DataForSEO found: ${dfsKeywords?.length || 0} | AI suggested: ${aiSuggestions.length}`);

        // 2. Validate AI Suggestions Volume
        let combinedKeywords = dfsKeywords || [];

        if (aiSuggestions.length > 0) {
            // Filter out suggestions that are already in DataForSEO results
            const existingTerms = new Set(combinedKeywords.map(k => k.keyword.toLowerCase()));
            const newAiTerms = aiSuggestions.filter(term => !existingTerms.has(term.toLowerCase()));

            if (newAiTerms.length > 0) {
                console.log(`[Related Keywords API] Validating volume for ${newAiTerms.length} AI terms...`);

                // Get volumes for new terms
                const volumes = await DataForSEO.getVolumes(newAiTerms, country);

                if (volumes) {
                    const aiKeywordObjects = newAiTerms.map(term => {
                        const metrics = volumes[term] || { volume: 0, cpc: 0, competition: 0, competition_index: 0 };
                        return {
                            keyword: term,
                            volume: metrics.volume,
                            difficulty: metrics.competition_index, // Proxy: Ads Competition Index (0-100) ~ Difficulty
                            intent: 'commercial', // Default for AI ideas
                            cpc: metrics.cpc,
                            competition: metrics.competition
                        };
                    }).filter(k => k.volume > 0); // FILTER OUT ZERO VOLUME

                    console.log(`[Related Keywords API] efficient AI terms found (Vol > 0): ${aiKeywordObjects.length}`);

                    // Merge lists (AI terms first to prioritize them in analysis?)
                    // Actually, let's append them. Analysis will pick the best.
                    combinedKeywords = [...combinedKeywords, ...aiKeywordObjects];
                }
            }
        }

        if (combinedKeywords.length === 0) {
            console.log('[Related Keywords API] No keywords found from DataForSEO or AI');
            return NextResponse.json({
                error: 'No se encontraron keywords relacionadas. Intenta con otra keyword.',
                keyword,
                refunded: false
            }, { status: 404 });
        }

        console.log(`[Related Keywords API] Total unique keywords for analysis: ${combinedKeywords.length}`);

        console.log('[Related Keywords API] Running GPT analysis...');

        // Analyze keywords with GPT for actionable recommendations
        const analysis = await OpenAIService.analyzeKeywordIdeas(keyword, combinedKeywords);

        // Filter out keywords that AI flagged as irrelevant/toxic
        const excludeList = analysis.keyword_usage_strategy?.keywords_to_exclude;
        let finalKeywords = combinedKeywords;

        if (excludeList && Array.isArray(excludeList) && excludeList.length > 0) {
            const forbiddenSet = new Set(excludeList.map((item: any) =>
                (typeof item === 'string' ? item : item.keyword).toLowerCase().trim()
            ));

            console.log(`[Related Keywords API] filtering ${forbiddenSet.size} toxic/generic keywords...`);

            finalKeywords = combinedKeywords.filter(k =>
                !forbiddenSet.has(k.keyword.toLowerCase().trim())
            );
            console.log(`[Related Keywords API] Filtered: ${combinedKeywords.length} -> ${finalKeywords.length}`);
        }

        console.log('[Related Keywords API] Analysis complete. Saving report...');

        // Save report to database
        const report = await prisma.keywordReport.create({
            data: {
                userId: session.user.id,
                projectId: projectId || null,
                seedKeyword: keyword,
                keywords: finalKeywords as any,
                analysis: analysis as any,
                country
            }
        });

        console.log('[Related Keywords API] Report saved:', report.id);

        return NextResponse.json({
            success: true,
            reportId: report.id,
            keyword,
            keywords: finalKeywords,
            analysis,
            count: finalKeywords.length,
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
