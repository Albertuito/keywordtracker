'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/pricing';
import { useBalance } from '@/hooks/useBalance';
import { Download, TrendingUp, TrendingDown, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type FilterType = 'all' | 'expenses' | 'income';

function BillingContent() {
    const { balance, balanceData, refetch } = useBalance();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Handle Stripe Success Callback
        if (searchParams.get('success') === 'true') {
            window.dispatchEvent(new Event('balanceUpdated'));
            refetch();
            router.replace('/settings/billing');
        }

        fetch('/api/transactions?limit=50')
            .then(res => res.json())
            .then(data => {
                setTransactions(data.transactions || []);
                setLoading(false);
            });
    }, [searchParams, router, refetch]);

    // Filter transactions
    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'income') return tx.amount > 0;
        if (filter === 'expenses') return tx.amount < 0;
        return true;
    });

    // Parse metadata safely
    const parseMetadata = (tx: any) => {
        if (!tx.metadata) return null;
        if (typeof tx.metadata === 'string') {
            try {
                return JSON.parse(tx.metadata);
            } catch {
                return null;
            }
        }
        return tx.metadata;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Historial de Facturación</h1>
                <p className="text-slate-400">Gestiona tu saldo y revisa tu historial de transacciones.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-slate-400 text-sm font-medium">Saldo Disponible</h3>
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(balance)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                        ~{Math.floor(balance / 0.05)} keyword checks
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-slate-400 text-sm font-medium">Total Recargado</h3>
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        +{balanceData ? formatCurrency(balanceData.totalRecharged) : '...'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Historial completo</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-slate-400 text-sm font-medium">Total Gastado</h3>
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-300">
                        -{balanceData ? formatCurrency(balanceData.totalSpent) : '...'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">En servicios</div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-white">Transacciones</h2>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-900 rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'all'
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter('expenses')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'expenses'
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Consumos
                            </button>
                            <button
                                onClick={() => setFilter('income')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'income'
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Recargas
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-700/50">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Cargando transacciones...
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No hay transacciones {filter !== 'all' ? 'de este tipo' : ''}.
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const meta = parseMetadata(tx);
                            const isIncome = tx.amount > 0;

                            return (
                                <div key={tx.id} className="p-4 hover:bg-slate-700/20 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Icon + Info */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`p-2 rounded-lg shrink-0 ${isIncome
                                                    ? 'bg-emerald-500/20'
                                                    : 'bg-slate-700'
                                                }`}>
                                                {isIncome ? (
                                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-white text-sm truncate">
                                                    {tx.description || (isIncome ? 'Recarga de saldo' : 'Consumo')}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>{new Date(tx.createdAt).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                    {meta?.keywordTerm && (
                                                        <>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-blue-400 font-medium truncate max-w-[150px]">
                                                                "{meta.keywordTerm}"
                                                            </span>
                                                        </>
                                                    )}
                                                    {meta?.projectName && (
                                                        <>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-slate-400 truncate max-w-[120px]">
                                                                {meta.projectName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Amount + Balance */}
                                        <div className="text-right shrink-0">
                                            <div className={`font-semibold ${isIncome ? 'text-emerald-400' : 'text-slate-300'
                                                }`}>
                                                {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Saldo: {formatCurrency(tx.balanceAfter)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
