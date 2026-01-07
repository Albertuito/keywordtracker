"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import { toast } from "sonner";

interface PayPalButtonProps {
    amount: number;
    onSuccess: () => void;
}

export default function PayPalPayment({ amount, onSuccess }: PayPalButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "EUR",
        intent: "capture",
    };

    return (
        <div className="w-full z-0 relative">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        layout: "horizontal",
                        color: "blue",
                        label: "pay",
                        height: 44
                    }}
                    forceReRender={[amount]} // Re-render if amount changes
                    disabled={isPending}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE", // Required by some type definitions
                            purchase_units: [
                                {
                                    amount: {
                                        value: amount.toFixed(2), // Ensure string format "10.00"
                                        currency_code: 'EUR'
                                    },
                                    description: `Recarga de saldo: ${amount}€`
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        setIsPending(true);
                        try {
                            // Call our backend to capture
                            const response = await fetch("/api/paypal/capture", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    orderID: data.orderID
                                }),
                            });

                            const result = await response.json();

                            if (response.ok) {
                                toast.success(`¡Recarga de ${amount}€ completada!`);
                                onSuccess();
                            } else {
                                throw new Error(result.error || "Error al procesar el pago");
                            }
                        } catch (err: any) {
                            console.error("PayPal Capture Error:", err);
                            toast.error(err.message || "Error al finalizar el pago con PayPal");
                        } finally {
                            setIsPending(false);
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Button Error:", err);
                        toast.error("Error conectando con PayPal");
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}
