import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addCredits } from '@/lib/balance'; // Assuming this utility exists, otherwise we'll write raw transaction logic

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { code } = await req.json();
        if (!code) {
            return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
        }

        const userId = session.user.id;
        const normalizedCode = code.toUpperCase().trim();

        // 1. Check Coupon Validity
        const coupon = await prisma.coupon.findUnique({
            where: { code: normalizedCode }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 404 });
        }

        if (!coupon.active) {
            return NextResponse.json({ error: 'El cupón ha sido desactivado' }, { status: 400 });
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: 'El cupón ha caducado' }, { status: 400 });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'Este cupón se ha agotado' }, { status: 400 });
        }

        // 2. Check if user already redeemed it
        const existingRedemption = await prisma.couponRedemption.findUnique({
            where: {
                couponId_userId: {
                    couponId: coupon.id,
                    userId
                }
            }
        });

        if (existingRedemption) {
            return NextResponse.json({ error: 'Ya has canjeado este código anteriormente' }, { status: 400 });
        }

        // 3. APPLY: Transaction + Redemption Record
        // We use a transaction to ensure atomic update
        await prisma.$transaction(async (tx) => {
            // Increment usage
            await tx.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
            });

            // Create redemption record
            await tx.couponRedemption.create({
                data: {
                    couponId: coupon.id,
                    userId
                }
            });

            // Add Balance (Using raw create if addCredits is not transaction-aware, but usually we just call it separately after logic check. 
            // Better to inline the balance update here for atomicity)

            // Re-fetch user balance or upsert
            const userBalance = await tx.userBalance.findUnique({ where: { userId } });
            if (!userBalance) {
                await tx.userBalance.create({
                    data: {
                        userId,
                        balance: coupon.amount,
                        totalRecharged: coupon.amount
                    }
                });
            } else {
                await tx.userBalance.update({
                    where: { userId },
                    data: {
                        balance: { increment: coupon.amount },
                        totalRecharged: { increment: coupon.amount }
                    }
                });
            }

            // Log Transaction
            await tx.balanceTransaction.create({
                data: {
                    userId,
                    type: 'recharge', // Or special 'gift' type? using recharge for now
                    amount: coupon.amount,
                    balanceBefore: userBalance ? userBalance.balance : 0,
                    balanceAfter: (userBalance ? userBalance.balance : 0) + coupon.amount,
                    description: `Canje de cupón: ${coupon.code}`,
                    metadata: JSON.stringify({ couponId: coupon.id })
                }
            });
        });

        return NextResponse.json({ success: true, amount: coupon.amount });

    } catch (e) {
        console.error('Coupon Redeem Error:', e);
        return NextResponse.json({ error: 'Error al canjear el cupón' }, { status: 500 });
    }
}
