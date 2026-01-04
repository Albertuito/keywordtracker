'use client';

import { useState, useEffect } from 'react';
import { Receipt, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

interface Transaction {
    id: string;
    type: string;
    action: string;
    amount: number;
    balanceAfter: number;
    description: string;
    metadata: string | null;
    createdAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [actions, setActions] = useState<string[]>([]);

    // Filters
    const [searchEmail, setSearchEmail] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [page, filterAction, dateFrom, dateTo]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50'
            });

            if (filterAction) params.set('action', filterAction);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);

            const res = await fetch(`/api/admin/transactions?${params}`);
            const data = await res.json();

            setTransactions(data.transactions || []);
            setPagination(data.pagination || { total: 0, pages: 1 });
            setActions(data.actions || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Fecha', 'Usuario', 'Acción', 'Tipo', 'Cantidad', 'Saldo', 'Descripción'];
        const rows = transactions.map(t => [
            new Date(t.createdAt).toLocaleString('es-ES'),
            t.user?.email || 'N/A',
            t.action,
            t.type,
            t.amount.toFixed(4),
            t.balanceAfter.toFixed(4),
            t.description
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredTransactions = transactions.filter(t =>
        !searchEmail || t.user?.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Receipt className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Log de Transacciones</h2>
                        <p className="text-sm text-slate-400">{pagination.total} transacciones totales</p>
                    </div>
                </div>
                <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-slate-800 border border-slate-500 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-200"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por email..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las acciones</option>
                        {actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-slate-500 rounded-lg"
                        placeholder="Desde"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-slate-500 rounded-lg"
                        placeholder="Hasta"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-900 text-slate-300 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Acción</th>
                                    <th className="px-4 py-3 text-center">Tipo</th>
                                    <th className="px-4 py-3 text-right">Cantidad</th>
                                    <th className="px-4 py-3 text-right">Saldo</th>
                                    <th className="px-4 py-3 text-left">Descripción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-900">
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                            {new Date(tx.createdAt).toLocaleString('es-ES', {
                                                day: '2-digit', month: '2-digit', year: '2-digit',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <a href={`/admin/users/${tx.user?.id}`} className="text-blue-400 hover:underline">
                                                {tx.user?.email || 'N/A'}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-200">{tx.action}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'credit' ? 'bg-green-100 text-green-400' : 'bg-red-100 text-red-400'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-mono ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                                            {formatCurrency(tx.balanceAfter)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate" title={tx.description}>
                                            {tx.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-600 bg-slate-900">
                        <span className="text-sm text-slate-400">
                            Página {page} de {pagination.pages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded border border-slate-500 hover:bg-slate-800 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 rounded border border-slate-500 hover:bg-slate-800 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

