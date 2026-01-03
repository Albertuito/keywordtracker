import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch transactions with filters
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const userId = searchParams.get('userId');
        const action = searchParams.get('action');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        // Build where clause
        const where: any = {};

        if (userId) {
            where.userId = userId;
        }

        if (action) {
            where.type = action;
        }

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo);
        }

        // Fetch transactions with pagination
        const [transactions, total] = await Promise.all([
            prisma.balanceTransaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.balanceTransaction.count({ where })
        ]);

        // Get unique actions for filter dropdown
        const actions = await prisma.balanceTransaction.groupBy({
            by: ['type'],
            _count: true
        });

        return NextResponse.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            actions: actions.map((a: { type: string }) => a.type)
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Error fetching transactions' }, { status: 500 });
    }
}
