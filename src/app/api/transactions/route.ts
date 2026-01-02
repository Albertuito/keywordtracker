import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTransactionHistory } from '@/lib/balance';

export async function GET(request: Request) {
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

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const type = searchParams.get('type') || undefined;

        const result = await getTransactionHistory(user.id, {
            limit,
            offset,
            type,
        });

        return NextResponse.json({
            transactions: result.transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                balanceBefore: t.balanceBefore,
                balanceAfter: t.balanceAfter,
                description: t.description,
                metadata: t.metadata ? JSON.parse(t.metadata) : null,
                createdAt: t.createdAt,
            })),
            total: result.total,
            hasMore: result.hasMore,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
