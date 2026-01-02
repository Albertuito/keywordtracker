import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/balance';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is missing');
        return new NextResponse('Webhook Error: Missing Secret', { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook Signature Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId;
        const creditsStr = session.metadata?.credits;

        if (userId && creditsStr) {
            const credits = parseFloat(creditsStr);

            console.log(`Processing recharge for user ${userId}: €${credits}`);

            const result = await addCredits(userId, credits, {
                packageId: session.metadata?.packageId,
                stripePaymentId: session.payment_intent as string,
                sessionId: session.id,
            });

            if (result.success) {
                console.log(`✅ Successfully added €${credits} to user ${userId}`);
            } else {
                console.error(`❌ Failed to add credits to user ${userId}`);
                return new NextResponse('Database Error', { status: 500 });
            }
        } else {
            console.error('Missing userId or credits in session metadata');
        }
    }

    return new NextResponse(null, { status: 200 });
}
