'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PayPalButton from './PayPalButton';

interface RechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
    const [amount, setAmount] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handlePurchase = async () => {
        if (amount < 5) return;

        try {
            setLoading(true);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No URL returned');
                alert('Error: ' + (data.error || 'No se pudo iniciar el pago.'));
                setLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error de conexión o servidor.');
            setLoading(false);
        }
    };

    const predefinedAmounts = [10, 20, 50, 100];

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors z-20 p-1"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 text-center border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-1">Recarga tu saldo</h2>
                    <p className="text-slate-400 text-sm">Elige la cantidad a añadir.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-200">Cantidad (€)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">€</span>
                            <input
                                type="number"
                                min="5"
                                step="1"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-600 rounded-xl p-4 pl-10 text-3xl font-bold text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Min Amount Warning */}
                    {amount < 5 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            El monto mínimo de recarga es de 5€.
                        </div>
                    )}

                    {/* Predefined Amounts - Mobile Optimized Grid */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {predefinedAmounts.map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${amount === val
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {val}€
                            </button>
                        ))}
                    </div>

                    {/* Payment Method Selector - More Visible */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-200">Método de Pago</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPaymentMethod('stripe')}
                                className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'stripe'
                                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                <div className="p-2 bg-slate-700 rounded-full">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-sm">Tarjeta</span>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('paypal')}
                                className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'paypal'
                                    ? 'bg-[#003087]/20 border-[#003087] text-white shadow-lg shadow-[#003087]/20'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                <div className="p-2 bg-[#003087] rounded-full text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7.076 21.337l.486-3.08c.017-.107.11-.186.218-.186h1.76c1.69 0 3.018-.328 3.93-1.61.595-.838.868-2.022.682-3.666-.35-3.087-2.73-4.707-6.05-4.707H3.486c-.168 0-.312.12-.34.286L.006 20.89c-.017.108.066.205.175.205h2.515c.135 0 .252-.095.274-.228l.47-2.903c.018-.108.112-.187.22-.187h1.666c.928 0 1.637.71 1.75 1.63.02.152.148.27.302.27h.007c.184 0 .324-.16.294-.34z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-sm">PayPal</span>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'stripe' ? (
                        <button
                            onClick={handlePurchase}
                            disabled={loading || amount < 5}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <span>Pagar {amount}€ con Tarjeta</span>
                            )}
                        </button>
                    ) : (
                        <div className="w-full min-h-[50px]">
                            {/* PayPal Button */}
                            <PayPalButton
                                amount={amount}
                                onSuccess={() => {
                                    onClose();
                                    // Optionally trigger a balance refresh context or toast
                                }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pago seguro
                        </span>
                        <span>•</span>
                        <span>SSL Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

