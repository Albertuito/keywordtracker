import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';
import { deductBalance } from '@/lib/balance';
import { PRICING } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { keyword, country = 'es', limit = 100 } = await req.json();

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

        // Fetch related keywords from DataForSEO
        const results = await DataForSEO.getRelatedKeywords(keyword, country, limit);

        if (!results) {
            // Refund on API failure? For now, we don't refund
            return NextResponse.json({
                error: 'Error fetching related keywords from DataForSEO',
                refunded: false
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            keyword,
            results,
            count: results.length,
            cost,
            newBalance: deductResult.newBalance
        });

    } catch (error) {
        console.error('Related Keywords API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
