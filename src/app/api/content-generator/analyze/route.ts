import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';

// Helper to count words (approximate)
function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}

// Helper to fetch and count words for a URL
async function getWordCount(url: string): Promise<number> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);

        if (!res.ok) return 0;

        const html = await res.text();
        // Simple HTML stripping
        const text = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        return countWords(text);
    } catch (e) {
        return 0;
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { keyword, country = 'es', language = 'es' } = await req.json();

        if (!keyword || keyword.trim().length === 0) {
            return NextResponse.json({ error: 'Keyword requerida' }, { status: 400 });
        }

        // Get location code for DataForSEO
        const locationCodes: Record<string, number> = {
            'es': 2724,  // Spain
            'mx': 2484,  // Mexico
            'ar': 2032,  // Argentina
            'us': 2840,  // USA
            'uk': 2826,  // UK
        };

        const locationCode = locationCodes[country] || 2724;

        // Call DataForSEO Extended SERP API (TOP 10)
        const serpResults = await DataForSEO.getSerpExtended(keyword.trim(), locationCode, language);

        if (!serpResults || serpResults.length === 0) {
            return NextResponse.json({ error: 'No se pudieron obtener resultados SERP' }, { status: 500 });
        }

        // Fetch word counts in parallel (limit to top 10)
        const resultsWithWordCounts = await Promise.all(
            serpResults.map(async (item: any) => {
                // simple skip for PDF/non-html
                if (item.url.endsWith('.pdf')) return { ...item, word_count: 0 };

                const word_count = await getWordCount(item.url);
                return { ...item, word_count };
            })
        );

        // Calculate average word count (excluding short/failed ones < 200 words)
        const validCounts = resultsWithWordCounts.filter((r: any) => r.word_count > 200).map((r: any) => r.word_count);
        const averageWordCount = validCounts.length > 0
            ? Math.round(validCounts.reduce((a: any, b: any) => a + b, 0) / validCounts.length)
            : 1500; // Default fallback

        // Return analyzed SERP data
        return NextResponse.json({
            success: true,
            keyword: keyword.trim(),
            country,
            language,
            results: resultsWithWordCounts,
            averageWordCount,
            analyzedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('SERP Analysis Error:', error);
        return NextResponse.json({ error: 'Error al analizar SERP' }, { status: 500 });
    }
}
