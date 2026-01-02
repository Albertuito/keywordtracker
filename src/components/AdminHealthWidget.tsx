'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

export default function AdminHealthWidget() {
    const [stats, setStats] = useState<{ balance: number | null, errors24h: number, recentErrors: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/health')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;

    if (!stats) return <div className="text-red-500">Error cargando salud del sistema</div>;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Salud del Sistema (DataForSEO)
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Saldo API
                    </div>
                    <div className={`text-2xl font-mono font-bold ${stats.balance === null ? 'text-gray-400' :
                            stats.balance < 5 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {stats.balance !== null ? `$${stats.balance.toFixed(2)}` : 'N/A'}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Errores (24h)
                    </div>
                    <div className={`text-2xl font-mono font-bold ${stats.errors24h > 0 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                        {stats.errors24h}
                    </div>
                </div>
            </div>

            {/* Error Log */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Errores Recientes</h4>
                {stats.recentErrors.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="w-4 h-4" /> Todo funciona correctamente
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {stats.recentErrors.map((err: any, i: number) => (
                            <li key={i} className="text-xs bg-red-50 text-red-700 p-2 rounded flex justify-between items-center">
                                <span className="truncate flex-1 font-mono">{err.error}</span>
                                <span className="font-bold ml-2">x{err.count}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
