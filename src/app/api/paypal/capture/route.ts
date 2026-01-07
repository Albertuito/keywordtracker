import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyNewRecharge } from "@/lib/email";

// Configure PayPal Environment
const Environment =
    process.env.PAYPAL_MODE === "live"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;

const client = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
);

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
        }

        // 1. Capture Payment in PayPal
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        console.log(`[PayPal] Capturing order ${orderID}...`);
        const capture = await client.execute(request);

        // 2. Verify Success
        const result = capture.result as any;

        if (result.status !== "COMPLETED") {
            console.error(`[PayPal] Capture failed: ${result.status}`);
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
        }

        console.log(`[PayPal] Payment completed for order ${orderID}`);

        // 3. Get Amount
        // PayPal returns amount in capture.result.purchase_units[0].payments.captures[0].amount.value
        // But safely we can check the top level purchase_units if we used intent=CAPTURE
        const purchaseUnit = result.purchase_units[0];
        const captureDetails = purchaseUnit.payments.captures[0];
        const amountStr = captureDetails.amount.value;
        const currency = captureDetails.amount.currency_code;
        const amount = parseFloat(amountStr);

        if (currency !== "EUR") {
            console.warn(`[PayPal] Warning: Currency is ${currency}, expected EUR`);
        }

        // 4. Add Balance to User
        await prisma.$transaction(async (tx) => {
            // Find user balance
            const userBalance = await tx.userBalance.findUnique({
                where: { userId: session.user.id }
            });

            if (!userBalance) {
                // Should exist from registration, but just in case
                await tx.userBalance.create({
                    data: {
                        userId: session.user.id,
                        balance: amount,
                        totalRecharged: amount,
                        totalSpent: 0
                    }
                });
            } else {
                // Update balance
                await tx.userBalance.update({
                    where: { userId: session.user.id },
                    data: {
                        balance: { increment: amount },
                        totalRecharged: { increment: amount }
                    }
                });
            }

            // Record Transaction
            // Record Transaction
            const balanceBefore = userBalance ? userBalance.balance : 0;
            const balanceAfter = balanceBefore + amount;

            await tx.balanceTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    type: 'recharge',
                    description: `Recarga PayPal (Order: ${orderID})`,
                    balanceBefore: balanceBefore,
                    balanceAfter: balanceAfter,
                    metadata: JSON.stringify({
                        paypalOrderId: orderID,
                        captureId: captureDetails.id,
                        method: 'PayPal'
                    })
                }
            });
        });

        console.log(`[PayPal] Added €${amount} to user ${session.user.id}`);

        // 5. Notify Admin
        if (session.user.email) {
            notifyNewRecharge(session.user.email, amount, 'PayPal')
                .catch(err => console.error("Email notification failed", err));
        }

        return NextResponse.json({ success: true, amount });

    } catch (error: any) {
        console.error("[PayPal] Error capturing payment:", error);
        return NextResponse.json(
            { error: error.message || "Error processing payment" },
            { status: 500 }
        );
    }
}
