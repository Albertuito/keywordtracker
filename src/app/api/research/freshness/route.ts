import { NextResponse } from 'next/server';
import { DataForSEO } from '@/lib/dataforseo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keyword, country = 'es' } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // Fetch Top 10 SERP Results
        // Defaulting to Spain (2724) if 'es', US (2840) if 'en'
        const locationCode = country === 'es' ? 2724 : 2840;
        const languageCode = country === 'es' ? 'es' : 'en';

        const results = await DataForSEO.getSERP(keyword, locationCode, languageCode);

        if (!results || results.length === 0) {
            return NextResponse.json({ error: 'No results found' }, { status: 404 });
        }

        // Analysis Logic
        const currentYear = new Date().getFullYear();
        const yearRegex = /(20\d{2})/; // Matches 2000-2099
        let oldResultsCount = 0;
        let totalDetectedDates = 0;
        const processedResults = [];

        for (const item of results) {
            const title = item.title || "";
            const snippet = item.snippet || "";
            const textToCheck = `${title} ${snippet}`;

            const match = textToCheck.match(yearRegex);
            let detectedYear = null;
            let isOld = false;

            if (match) {
                detectedYear = parseInt(match[0]);
                totalDetectedDates++;
                // If content is older than 2 years (e.g. < 2024 if we are in 2026)
                // "Freshness Gap" usually means finding content OLDER than Current Year - 1 or 2.
                // Strict: Older than 2 years is definitely outdated.
                if (detectedYear < (currentYear - 1)) {
                    isOld = true;
                    // Boost count for top 3 results specifically?
                    // For now, simple count.
                    oldResultsCount++;
                }
            }

            processedResults.push({
                rank: item.rank_group,
                title: item.title,
                url: item.url,
                snippet: item.snippet,
                detected_year: detectedYear,
                is_old: isOld
            });
        }

        // Scoring: 
        // If > 30% of results are "Old", it's a gap.
        // If Top 1 is Old, massive opportunity.
        const top1IsOld = processedResults[0]?.is_old || false;
        const score = (oldResultsCount / (totalDetectedDates || 1)) * 100;

        const isOpportunity = top1IsOld || score > 30; // Heuristic

        return NextResponse.json({
            keyword,
            is_opportunity: isOpportunity,
            freshness_score: Math.round(score),
            top_result_is_old: top1IsOld,
            total_dated_results: totalDetectedDates,
            results: processedResults
        });

    } catch (error) {
        console.error('Freshness API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
