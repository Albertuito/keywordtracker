'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/pricing';
import { useBalance } from '@/hooks/useBalance';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FolderOpen } from 'lucide-react';

type FilterType = 'all' | 'expenses' | 'income';

function BillingContent() {
    const { balance, balanceData, refetch } = useBalance();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        // Handle Stripe Success Callback
        if (searchParams.get('success') === 'true') {
            window.dispatchEvent(new Event('balanceUpdated'));
            refetch();
            router.replace('/settings/billing');
        }

        fetch('/api/transactions?limit=100')
            .then(res => res.json())
            .then(data => {
                setTransactions(data.transactions || []);
                setLoading(false);
            });
    }, [searchParams, router, refetch]);

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

    // Get unique projects from transactions
    const projects = useMemo(() => {
        const projectMap = new Map<string, { id: string, name: string, spent: number }>();

        transactions.forEach(tx => {
            const meta = parseMetadata(tx);
            if (meta?.projectId && tx.amount < 0) {
                const existing = projectMap.get(meta.projectId);
                if (existing) {
                    existing.spent += Math.abs(tx.amount);
                } else {
                    projectMap.set(meta.projectId, {
                        id: meta.projectId,
                        name: meta.projectName || 'Proyecto desconocido',
                        spent: Math.abs(tx.amount)
                    });
                }
            }
        });

        return Array.from(projectMap.values()).sort((a, b) => b.spent - a.spent);
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            // Type filter
            if (filter === 'income' && tx.amount <= 0) return false;
            if (filter === 'expenses' && tx.amount >= 0) return false;

            // Project filter
            if (projectFilter !== 'all') {
                const meta = parseMetadata(tx);
                if (meta?.projectId !== projectFilter) return false;
            }

            return true;
        });
    }, [transactions, filter, projectFilter]);

    // Calculate filtered totals
    const filteredTotal = useMemo(() => {
        return filteredTransactions
            .filter(tx => tx.amount < 0)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    }, [filteredTransactions]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Historial de Facturación</h1>
                <p className="text-slate-400 text-sm">Gestiona tu saldo y revisa tu historial de transacciones.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Saldo Disponible</h3>
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(balance)}</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Total Recargado</h3>
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        +{balanceData ? formatCurrency(balanceData.totalRecharged) : '...'}
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Total Gastado</h3>
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-300">
                        -{balanceData ? formatCurrency(balanceData.totalSpent) : '...'}
                    </div>
                </div>
            </div>

            {/* Investment by Project */}
            {projects.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-slate-400" />
                        Inversión por Proyecto
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {projects.map(proj => (
                            <button
                                key={proj.id}
                                onClick={() => setProjectFilter(projectFilter === proj.id ? 'all' : proj.id)}
                                className={`p-3 rounded-lg border transition-all text-left ${projectFilter === proj.id
                                        ? 'bg-blue-500/20 border-blue-500/50'
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="text-xs text-slate-400 truncate">{proj.name}</div>
                                <div className="text-lg font-bold text-white">{formatCurrency(proj.spent)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-white">Transacciones</h2>
                        {projectFilter !== 'all' && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                {projects.find(p => p.id === projectFilter)?.name}
                            </span>
                        )}
                        {filteredTotal > 0 && filter !== 'income' && (
                            <span className="text-xs text-slate-500">
                                Total: {formatCurrency(filteredTotal)}
                            </span>
                        )}
                    </div>

                    {/* Filter Tabs */}
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

                <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Cargando transacciones...
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No hay transacciones {filter !== 'all' || projectFilter !== 'all' ? 'con estos filtros' : ''}.
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
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                                    <span>{new Date(tx.createdAt).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                    {meta?.keywordTerm && (
                                                        <>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-blue-400 font-medium truncate max-w-[140px]">
                                                                "{meta.keywordTerm}"
                                                            </span>
                                                        </>
                                                    )}
                                                    {meta?.projectName && projectFilter === 'all' && (
                                                        <>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-slate-400 truncate max-w-[100px]">
                                                                {meta.projectName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Amount */}
                                        <div className="text-right shrink-0">
                                            <div className={`font-semibold ${isIncome ? 'text-emerald-400' : 'text-slate-300'
                                                }`}>
                                                {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
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
