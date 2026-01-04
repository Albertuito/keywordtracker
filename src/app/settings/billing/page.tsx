'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/pricing';
import { useBalance } from '@/hooks/useBalance';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

function BillingContent() {
    const { balance, balanceData, refetch } = useBalance();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Handle Stripe Success Callback
        if (searchParams.get('success') === 'true') {
            window.dispatchEvent(new Event('balanceUpdated'));
            refetch(); // Explicit refetch for this page stats
            // Clean URL
            router.replace('/settings/billing');
        }

        fetch('/api/transactions?limit=20')
            .then(res => res.json())
            .then(data => {
                setTransactions(data.transactions || []);
                setLoading(false);
            });
    }, [searchParams, router, refetch]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Facturación y Créditos</h1>
                <p className="text-slate-400">Gestiona tu saldo y revisa tu historial de transacciones.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Saldo Disponible</h3>
                    <div className="text-3xl font-bold text-white">{formatCurrency(balance)}</div>
                    <div className="mt-2 text-xs text-emerald-400">
                        ~{Math.floor(balance / 0.005)} keyword checks
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Recargado</h3>
                    <div className="text-3xl font-bold text-white">
                        {balanceData ? formatCurrency(balanceData.totalRecharged) : '...'}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Histórico de recargas</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-400 text-sm font-medium mb-2">Total Gastado</h3>
                    <div className="text-3xl font-bold text-white">
                        {balanceData ? formatCurrency(balanceData.totalSpent) : '...'}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">En servicios de la plataforma</div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Historial de Transacciones</h2>
                    <button className="text-slate-400 hover:text-white transition-colors">
                        <Download size={18} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Descripción</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3 text-right">Importe</th>
                                <th className="px-6 py-3 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">Cargando transacciones...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">No hay transacciones aún.</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(tx.createdAt).toLocaleDateString()} <span className="text-slate-600 text-xs ml-1">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300 font-medium block">{tx.description}</span>
                                            {tx.metadata?.keywordTerm && (
                                                <span className="text-xs text-slate-500">{tx.metadata.keywordTerm}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.type === 'recharge' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                    <TrendingUp size={12} /> Recarga
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700/50 text-slate-300 text-xs font-medium">
                                                    <TrendingDown size={12} /> Consumo
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500">
                                            {formatCurrency(tx.balanceAfter)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400">Cargando facturación...</div>
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}

