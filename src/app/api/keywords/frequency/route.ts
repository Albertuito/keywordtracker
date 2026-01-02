import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const VALID_FREQUENCIES = ['manual', 'daily', 'every_2_days', 'weekly'];

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { keywordIds, frequency } = body;

        if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
            return NextResponse.json({ error: 'keywordIds array required' }, { status: 400 });
        }

        if (!frequency || !VALID_FREQUENCIES.includes(frequency)) {
            return NextResponse.json({
                error: 'Invalid frequency. Must be: manual, daily, every_2_days, or weekly'
            }, { status: 400 });
        }

        // Verify ownership of keywords
        const keywords = await prisma.keyword.findMany({
            where: {
                id: { in: keywordIds },
                project: {
                    user: { email: session.user.email }
                }
            }
        });

        if (keywords.length === 0) {
            return NextResponse.json({ error: 'No valid keywords found' }, { status: 404 });
        }

        // Update frequency
        await prisma.keyword.updateMany({
            where: {
                id: { in: keywords.map(k => k.id) }
            },
            data: {
                trackingFrequency: frequency
            }
        });

        return NextResponse.json({
            success: true,
            updated: keywords.length,
            frequency
        });

    } catch (error) {
        console.error('Error updating frequency:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
