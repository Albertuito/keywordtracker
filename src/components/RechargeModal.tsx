'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface RechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
    const [amount, setAmount] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

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

                    <div className="grid grid-cols-4 gap-2">
                        {predefinedAmounts.map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${amount === val
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-700 text-slate-300 hover:bg-gray-200'
                                    }`}
                            >
                                {val}€
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <span>Pagar {amount}€ con Stripe</span>
                        )}
                    </button>

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

