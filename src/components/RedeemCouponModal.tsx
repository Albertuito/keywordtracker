'use client';

import { useState } from 'react';
import { Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RedeemCouponModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RedeemCouponModal({ isOpen, onClose }: RedeemCouponModalProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/coupons/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: `¡Éxito! Has recibido €${data.amount}` });
                setTimeout(() => {
                    router.refresh(); // Update balance in UI
                    onClose();
                    setStatus(null);
                    setCode('');
                }, 2000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Error al canjear' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Tag className="w-5 h-5" /> Canjear Código
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-200 mb-1">Código Promocional</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="ABC-123"
                                className="w-full px-4 py-2 border border-slate-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase font-mono bg-slate-700 text-white placeholder-slate-400"
                                disabled={isLoading || status?.type === 'success'}
                            />
                        </div>

                        {status && (
                            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !code.trim() || status?.type === 'success'}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Canjear'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

