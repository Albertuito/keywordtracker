// Balance management utilities
import prisma from './prisma';
import { PRICING, PricingAction, getActionDescription } from './pricing';

interface DeductBalanceOptions {
    userId: string;
    action: PricingAction;
    metadata?: {
        keywordId?: string;
        keywordTerm?: string;
        projectId?: string;
        projectName?: string;
        [key: string]: any;
    };
}

interface DeductBalanceResult {
    success: boolean;
    newBalance: number;
    transactionId?: string;
    error?: string;
}

/**
 * Deduct balance from user account for a specific action
 */
export async function deductBalance(
    options: DeductBalanceOptions
): Promise<DeductBalanceResult> {
    const { userId, action, metadata = {} } = options;
    const cost = PRICING[action];

    try {
        // Get or create user balance
        let userBalance = await prisma.userBalance.findUnique({
            where: { userId },
        });

        if (!userBalance) {
            // Create balance record with initial €2 free credits for new users
            userBalance = await prisma.userBalance.create({
                data: {
                    userId,
                    balance: 1.00, // €1 free credits
                    totalRecharged: 0,
                },
            });
        }

        // Check if user has sufficient balance
        if (userBalance.balance < cost) {
            return {
                success: false,
                newBalance: userBalance.balance,
                error: 'Insufficient balance',
            };
        }

        const balanceBefore = userBalance.balance;
        const balanceAfter = balanceBefore - cost;

        // Perform transaction atomically
        const [updatedBalance, transaction] = await prisma.$transaction([
            // Update balance
            prisma.userBalance.update({
                where: { userId },
                data: {
                    balance: balanceAfter,
                    totalSpent: { increment: cost },
                },
            }),
            // Create transaction record
            prisma.balanceTransaction.create({
                data: {
                    userId,
                    type: action,
                    amount: -cost,
                    balanceBefore,
                    balanceAfter,
                    description: getActionDescription(action, metadata),
                    metadata: JSON.stringify(metadata),
                },
            }),
        ]);

        return {
            success: true,
            newBalance: updatedBalance.balance,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error('Error deducting balance:', error);
        return {
            success: false,
            newBalance: 0,
            error: 'Failed to deduct balance',
        };
    }
}

/**
 * Add credits to user account (recharge)
 */
export async function addCredits(
    userId: string,
    amount: number,
    metadata?: {
        package?: string;
        stripePaymentId?: string;
        [key: string]: any;
    }
): Promise<{ success: boolean; newBalance: number }> {
    try {
        // Get or create user balance
        let userBalance = await prisma.userBalance.findUnique({
            where: { userId },
        });

        if (!userBalance) {
            userBalance = await prisma.userBalance.create({
                data: {
                    userId,
                    balance: 0,
                },
            });
        }

        const balanceBefore = userBalance.balance;
        const balanceAfter = balanceBefore + amount;

        // Perform transaction atomically
        const [updatedBalance] = await prisma.$transaction([
            // Update balance
            prisma.userBalance.update({
                where: { userId },
                data: {
                    balance: balanceAfter,
                    totalRecharged: { increment: amount },
                },
            }),
            // Create transaction record
            prisma.balanceTransaction.create({
                data: {
                    userId,
                    type: 'recharge',
                    amount,
                    balanceBefore,
                    balanceAfter,
                    description: `Balance recharge: €${amount.toFixed(2)}`,
                    metadata: JSON.stringify(metadata || {}),
                },
            }),
        ]);

        return {
            success: true,
            newBalance: updatedBalance.balance,
        };
    } catch (error) {
        console.error('Error adding credits:', error);
        return {
            success: false,
            newBalance: 0,
        };
    }
}

/**
 * Get user balance
 */
export async function getUserBalance(userId: string) {
    let userBalance = await prisma.userBalance.findUnique({
        where: { userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    // Create balance if doesn't exist (with €2 free credits)
    if (!userBalance) {
        userBalance = await prisma.userBalance.create({
            data: {
                userId,
                balance: 1.00,
                totalRecharged: 0,
            },
            include: {
                transactions: true,
            },
        });
    }

    return userBalance;
}

/**
 * Check if user has sufficient balance for an action
 */
export async function hasBalance(
    userId: string,
    action: PricingAction
): Promise<boolean> {
    const cost = PRICING[action];
    const userBalance = await prisma.userBalance.findUnique({
        where: { userId },
    });

    if (!userBalance) {
        // New users get €2 free, check if that's enough
        return 1.00 >= cost;
    }

    return userBalance.balance >= cost;
}

/**
 * Get transaction history for user
 */
export async function getTransactionHistory(
    userId: string,
    options?: {
        limit?: number;
        offset?: number;
        type?: string;
    }
) {
    const { limit = 50, offset = 0, type } = options || {};

    const where: any = { userId };
    if (type) {
        where.type = type;
    }

    const [transactions, total] = await Promise.all([
        prisma.balanceTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.balanceTransaction.count({ where }),
    ]);

    return {
        transactions,
        total,
        hasMore: offset + limit < total,
    };
}
