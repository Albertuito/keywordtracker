import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PRICING } from '@/lib/pricing';

// GET - Fetch current pricing (from DB or defaults)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Try to get pricing from DB
        const dbPricing = await prisma.systemSetting.findUnique({
            where: { key: 'pricing' }
        });

        if (dbPricing) {
            return NextResponse.json({
                source: 'database',
                pricing: JSON.parse(dbPricing.value)
            });
        }

        // Return hardcoded defaults
        return NextResponse.json({
            source: 'default',
            pricing: PRICING
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching pricing' }, { status: 500 });
    }
}

// POST - Update pricing in DB
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { pricing } = await req.json();

        // Validate pricing object has required keys
        const requiredKeys = Object.keys(PRICING);
        for (const key of requiredKeys) {
            if (typeof pricing[key] !== 'number' || pricing[key] < 0) {
                return NextResponse.json({
                    error: `Invalid value for ${key}. Must be a non-negative number.`
                }, { status: 400 });
            }
        }

        // Upsert pricing in DB
        await prisma.systemSetting.upsert({
            where: { key: 'pricing' },
            update: { value: JSON.stringify(pricing) },
            create: { key: 'pricing', value: JSON.stringify(pricing) }
        });

        return NextResponse.json({ success: true, pricing });
    } catch (error) {
        console.error('Error updating pricing:', error);
        return NextResponse.json({ error: 'Error updating pricing' }, { status: 500 });
    }
}
