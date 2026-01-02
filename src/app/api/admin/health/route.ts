import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [balance, errorStats] = await Promise.all([
            DataForSEO.getAccountBalance(),
            prisma.keyword.groupBy({
                by: ['lastUpdateError'],
                where: {
                    lastUpdateError: { not: null },
                    updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
                },
                _count: {
                    lastUpdateError: true
                }
            })
        ]);

        const totalErrors = errorStats.reduce((acc, curr) => acc + curr._count.lastUpdateError, 0);

        return NextResponse.json({
            balance: balance,
            errors24h: totalErrors,
            recentErrors: errorStats.map(e => ({ error: e.lastUpdateError, count: e._count.lastUpdateError }))
        });

    } catch (e) {
        return NextResponse.json({ error: 'Error fetching health stats' }, { status: 500 });
    }
}
