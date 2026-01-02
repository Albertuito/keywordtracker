import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    // STRICT LOCKDOWN
    if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.email !== 'infoinfolinfo@gmail.com')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId, amount, type, description } = body; // amount should be positive. type: 'credit' | 'debit'

        if (!userId || !amount || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const userBalance = await prisma.userBalance.findUnique({
            where: { userId }
        });

        if (!userBalance) {
            return NextResponse.json({ error: 'User balance not found' }, { status: 404 });
        }

        const adjustment = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
        const newBalance = userBalance.balance + adjustment;

        // Atomic transaction
        await prisma.$transaction([
            prisma.userBalance.update({
                where: { userId },
                data: {
                    balance: newBalance,
                    // Optionally update totalRecharged if it's a credit, but maybe kept separate for "Real Revenue" vs "Gift"
                    // Let's NOT update totalRecharged for manual adjustments to keep revenue metrics clean.
                }
            }),
            prisma.balanceTransaction.create({
                data: {
                    userId,
                    type: 'admin_adjustment',
                    amount: adjustment,
                    balanceBefore: userBalance.balance,
                    balanceAfter: newBalance,
                    description: description || (type === 'credit' ? 'Manual Credit' : 'Manual Debit'),
                    metadata: JSON.stringify({ adminEmail: session.user.email })
                }
            })
        ]);

        return NextResponse.json({ success: true, newBalance });

    } catch (error) {
        console.error("Error adjusting balance:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
