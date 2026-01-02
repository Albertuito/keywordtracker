import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';
import { OpenAIService } from '@/lib/openai';
import { deductBalance } from '@/lib/balance';
import { PRICING } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { keyword, country = 'es', limit = 50 } = await req.json();

        if (!keyword || typeof keyword !== 'string') {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // Deduct balance first
        const cost = PRICING.related_keywords;
        const deductResult = await deductBalance({
            userId: session.user.id,
            action: 'related_keywords',
            metadata: { keyword }
        });

        if (!deductResult.success) {
            return NextResponse.json({
                error: deductResult.error || 'Saldo insuficiente',
                required: cost
            }, { status: 402 });
        }

        // Fetch keyword ideas from DataForSEO Labs (better quality)
        const keywords = await DataForSEO.getKeywordIdeas(keyword, country, limit);

        if (!keywords || keywords.length === 0) {
            return NextResponse.json({
                error: 'No se encontraron keywords relacionadas',
                refunded: false
            }, { status: 404 });
        }

        // Analyze keywords with GPT for actionable recommendations
        const analysis = await OpenAIService.analyzeKeywordIdeas(keyword, keywords);

        return NextResponse.json({
            success: true,
            keyword,
            keywords,
            analysis,
            count: keywords.length,
            cost,
            newBalance: deductResult.newBalance
        });

    } catch (error) {
        console.error('Related Keywords API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
