
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths, format, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Default to last 30 days
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30days'; // 30days, year, all

        let dateFrom = new Date();
        if (period === 'year') {
            dateFrom = subMonths(new Date(), 12);
        } else {
            dateFrom = subMonths(new Date(), 1); // 30 days
        }

        const transactions = await prisma.balanceTransaction.findMany({
            where: {
                createdAt: {
                    gte: dateFrom
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Aggregation
        const days = eachDayOfInterval({
            start: dateFrom,
            end: new Date()
        });

        const chartData = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayTransactions = transactions.filter(t =>
                format(new Date(t.createdAt), 'yyyy-MM-dd') === dayStr
            );

            const revenue = dayTransactions
                .filter(t => t.type === 'recharge' || t.amount > 0)
                .reduce((acc, t) => acc + t.amount, 0);

            const cost = dayTransactions
                .filter(t => t.type !== 'recharge' && t.amount < 0)
                .reduce((acc, t) => acc + Math.abs(t.amount), 0);

            return {
                date: dayStr,
                displayDate: format(day, 'd MMM', { locale: es }),
                revenue,
                cost,
                profit: revenue - cost
            };
        });

        // Totals
        const totals = {
            revenue: transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0),
            cost: transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0),
            profit: 0
        };
        totals.profit = totals.revenue - totals.cost;

        return NextResponse.json({
            chartData,
            totals
        });

    } catch (error) {
        console.error('Error fetching finance data:', error);
        return NextResponse.json({ error: 'Error fetching finance data' }, { status: 500 });
    }
}
