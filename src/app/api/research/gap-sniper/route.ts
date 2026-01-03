import { NextResponse } from 'next/server';
import { DataForSEO } from '@/lib/dataforseo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const FORUM_DOMAINS = [
    'reddit.com', 'quora.com', 'forocoches.com', 'burbuja.info',
    'enfemenino.com', 'tripadvisor.', 'yahoo.com', 'stackexchange.com', 'stackoverflow.com'
];

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { topic, country = 'es' } = await req.json();

        // 1. Get Keywords
        const ideas = await DataForSEO.getKeywordIdeas(topic, country, 10); // Check 10 high volume keywords
        if (!ideas || ideas.length === 0) {
            return NextResponse.json({ error: 'No keywords found' }, { status: 404 });
        }

        // 2. Fetch SERPs in Parallel
        // We need to map country code to location/lang for DataForSEO
        const locationMap: any = {
            'es': { loc: 2724, lang: 'es' },
            'mx': { loc: 2484, lang: 'es' },
            'ar': { loc: 2032, lang: 'es' },
            'co': { loc: 2170, lang: 'es' },
            'cl': { loc: 2152, lang: 'es' },
            'pe': { loc: 2604, lang: 'es' },
        };
        const config = locationMap[country] || locationMap['es'];

        const serpPromises = ideas.map(async (idea) => {
            const serp = await DataForSEO.getSERP(idea.keyword, config.loc, config.lang);
            return { keyword: idea, serp };
        });

        const results = await Promise.all(serpPromises);

        // 3. Analyze for Forums
        const opportunities = results.map(({ keyword, serp }) => {
            if (!serp) return null;

            // Find forums in top results
            const forumsFound = serp.filter((item: any) => {
                return FORUM_DOMAINS.some(domain => item.url?.includes(domain));
            }).map((item: any) => ({
                rank: item.rank_group,
                domain: FORUM_DOMAINS.find(d => item.url?.includes(d)) || 'forum',
                url: item.url,
                title: item.title
            }));

            // It's an opportunity if a forum is in Top 5 (or Top 3?)
            // Let's say if ANY forum is found in Top 5.
            const isOpportunity = forumsFound.some((f: any) => f.rank <= 5);

            if (!isOpportunity) return null;

            return {
                keyword: keyword.keyword,
                volume: keyword.volume,
                difficulty: keyword.difficulty,
                found_forums: forumsFound
            };
        }).filter(Boolean); // Remove nulls

        return NextResponse.json({
            status: 'success',
            topic,
            opportunities
        });

    } catch (error) {
        console.error('Gap Sniper Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
