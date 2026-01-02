import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
        }

        // Try to fetch balance - simplistic call to verify key and connection
        const balance = await stripe.balance.retrieve();

        return NextResponse.json({
            success: true,
            message: 'Stripe connection successful',
            balance_available: balance.available[0]?.amount
        });
    } catch (error: any) {
        console.error('Stripe Test Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            type: error.type,
            code: error.code,
            details: error
        }, { status: 500 });
    }
}
