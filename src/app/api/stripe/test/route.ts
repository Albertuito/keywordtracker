import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const key = process.env.STRIPE_SECRET_KEY;

        // Debug info (safe)
        const debugInfo = {
            hasKey: !!key,
            keyLength: key ? key.length : 0,
            keyStart: key ? key.substring(0, 7) : 'none',
            envCHECK: process.env.NODE_ENV
        };

        if (!key) {
            return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY', debug: debugInfo }, { status: 500 });
        }

        // Initialize locally to catch init errors
        const stripe = new Stripe(key.trim(), {
            apiVersion: '2023-10-16',
            typescript: true,
        });

        const balance = await stripe.balance.retrieve();

        return NextResponse.json({
            success: true,
            message: 'Stripe connection successful',
            balance_available: balance.available[0]?.amount,
            debug: debugInfo
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
