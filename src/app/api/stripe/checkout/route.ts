import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, getAbsoluteUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prisma = (await import('@/lib/prisma')).default;
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: `User not found for email: ${session.user.email}` }, { status: 404 });
        }

        const { amount } = await req.json();

        // Validate amount
        if (!amount || typeof amount !== 'number' || amount < 5) {
            return NextResponse.json({ error: 'Invalid amount (min €5)' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: user.email!,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Recarga de Saldo - KeywordTracker`,
                            description: `Añadir €${amount} al saldo de tu cuenta`,
                        },
                        unit_amount: amount * 100, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                credits: amount.toString(), // Store amount as credits (1:1 EUR mapping)
            },
            success_url: getAbsoluteUrl('/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}'),
            cancel_url: getAbsoluteUrl('/settings/billing?canceled=true'),
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error', details: JSON.stringify(error) },
            { status: 500 }
        );
    }
}
