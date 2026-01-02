import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: List all coupons (Admin Only)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { redemptions: true }
                }
            }
        });
        return NextResponse.json(coupons);
    } catch (e) {
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }
}

// POST: Create a new coupon (Admin Only)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { code, amount, maxUses, expiresAt } = body;

        if (!code || !amount) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                amount: parseFloat(amount),
                maxUses: parseInt(maxUses) || 1,
                usedCount: 0,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: true
            }
        });

        return NextResponse.json(coupon);
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: 'El código ya existe' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating coupon' }, { status: 500 });
    }
}

// DELETE: Deactivate/Delete coupon
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        const coupon = await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Error deleting coupon' }, { status: 500 });
    }
}
