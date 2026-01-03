import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DataForSEO } from '@/lib/dataforseo';
import { deductBalance } from '@/lib/balance';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { keywordIds } = body;

        if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
            return NextResponse.json({ error: 'keywordIds array required' }, { status: 400 });
        }

        // Get keywords and verify ownership
        const keywords = await prisma.keyword.findMany({
            where: {
                id: { in: keywordIds },
                project: {
                    user: { email: session.user.email }
                }
            },
            include: {
                project: {
                    select: { userId: true }
                }
            }
        });

        if (keywords.length === 0) {
            return NextResponse.json({ error: 'No valid keywords found' }, { status: 404 });
        }

        const userId = keywords[0].project.userId;
        const termsToFetch: string[] = [];
        const results: any[] = [];

        // Check which keywords need volume fetched
        for (const kw of keywords) {
            // Check if already in cache
            const cached = await prisma.cachedVolume.findUnique({
                where: { term: kw.term }
            });

            if (cached) {
                // Already have it, just sync to keyword
                await prisma.keyword.update({
                    where: { id: kw.id },
                    data: { volume: cached.volume }
                });
                results.push({ keywordId: kw.id, term: kw.term, volume: cached.volume, charged: false });
            } else {
                termsToFetch.push(kw.term);
            }
        }

        // Fetch missing volumes
        if (termsToFetch.length > 0) {
            // Deduct balance for each term
            for (const term of termsToFetch) {
                const balanceResult = await deductBalance({
                    userId,
                    action: 'search_volume',
                    metadata: { term }
                });

                if (!balanceResult.success) {
                    return NextResponse.json({
                        error: `Insufficient balance. Need €${(0.03 * termsToFetch.length).toFixed(2)} for ${termsToFetch.length} keywords.`,
                        required: 0.03 * termsToFetch.length,
                        current: balanceResult.newBalance
                    }, { status: 402 });
                }
            }

            // Fetch from DataForSEO
            const volumes = await DataForSEO.getVolumes(termsToFetch);

            if (volumes) {
                // Save to cache and update keywords
                for (const term of termsToFetch) {
                    const metric = volumes[term];
                    const vol = metric ? metric.volume : 0;

                    // Save to cache
                    await prisma.cachedVolume.upsert({
                        where: { term },
                        update: { volume: vol, updatedAt: new Date() },
                        create: { term, volume: vol }
                    });

                    // Update keyword
                    const kw = keywords.find(k => k.term === term);
                    if (kw) {
                        await prisma.keyword.update({
                            where: { id: kw.id },
                            data: { volume: vol }
                        });
                        results.push({ keywordId: kw.id, term, volume: vol, charged: true });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            results,
            charged: termsToFetch.length,
            total: keywords.length
        });

    } catch (error) {
        console.error('Error fetching volumes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
