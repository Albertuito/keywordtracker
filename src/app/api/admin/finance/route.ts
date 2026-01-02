import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Total Stats
        const totalRecharged = await prisma.balanceTransaction.aggregate({
            where: { type: 'recharge' },
            _sum: { amount: true }
        });

        const totalUsed = await prisma.balanceTransaction.aggregate({
            where: { type: 'usage' },
            _sum: { amount: true }
        });

        // 2. Last 30 Days Breakdown
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await prisma.balanceTransaction.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            orderBy: { createdAt: 'asc' },
            select: {
                createdAt: true,
                type: true,
                amount: true
            }
        });

        // Group by Day
        const dailyStats = transactions.reduce((acc: any, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, recharge: 0, usage: 0 };
            }
            if (curr.type === 'recharge') {
                acc[date].recharge += curr.amount;
            } else if (curr.type === 'usage') {
                // Usage is usually negative in DB? checking schema/worker.
                // In worker.ts: await addCredits(userId, -cost, ...)
                // So usage is stored as negative.
                acc[date].usage += Math.abs(curr.amount);
            }
            return acc;
        }, {});

        return NextResponse.json({
            total: {
                recharged: totalRecharged._sum.amount || 0,
                used: Math.abs(totalUsed._sum.amount || 0), // Usage might be negative
                net: (totalRecharged._sum.amount || 0) - Math.abs(totalUsed._sum.amount || 0)
            },
            daily: Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date))
        });

    } catch (e) {
        return NextResponse.json({ error: 'Error fetching financial stats' }, { status: 500 });
    }
}
