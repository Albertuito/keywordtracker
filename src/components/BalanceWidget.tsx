'use client';

import { useState } from 'react';
import { useBalance } from '@/hooks/useBalance';
import RechargeModal from './RechargeModal';
import RedeemCouponModal from './RedeemCouponModal';
import { Ticket } from 'lucide-react';

export default function BalanceWidget() {
    const { balance, loading } = useBalance();
    const [showRecharge, setShowRecharge] = useState(false);
    const [showRedeem, setShowRedeem] = useState(false);

    if (loading) {
        return (
            <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
        );
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className={`text-sm font-bold ${balance < 2 ? 'text-red-500' : 'text-gray-900'}`}>
                        {balance.toFixed(2)} €
                    </div>
                    {balance < 2 && (
                        <div className="text-[10px] text-red-500 font-medium animate-pulse">
                            ¡Saldo Bajo!
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowRecharge(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                    Recargar
                </button>
                <button
                    onClick={() => setShowRedeem(true)}
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-1.5 rounded-lg transition-colors"
                    title="Canjear Cupón"
                >
                    <Ticket className="w-5 h-5" />
                </button>
            </div>

            <RechargeModal
                isOpen={showRecharge}
                onClose={() => setShowRecharge(false)}
            />
            <RedeemCouponModal
                isOpen={showRedeem}
                onClose={() => setShowRedeem(false)}
            />
        </>
    );
}
