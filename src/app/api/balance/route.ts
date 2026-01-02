import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserBalance } from '@/lib/balance';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prisma = (await import('@/lib/prisma')).default;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const balance = await getUserBalance(user.id);

        return NextResponse.json({
            balance: balance.balance,
            totalSpent: balance.totalSpent,
            totalRecharged: balance.totalRecharged,
            recentTransactions: balance.transactions.slice(0, 5).map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                balanceAfter: t.balanceAfter,
                description: t.description,
                createdAt: t.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balance' },
            { status: 500 }
        );
    }
}
