'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

export default function AdminFinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/finance')
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Cargando datos financieros...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Error al cargar datos</div>;

    const maxVal = Math.max(...data.daily.map((d: any) => Math.max(d.recharge, d.usage)));

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                Reporte Financiero
            </h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" /> Total Ingresos (Recargas)
                    </div>
                    <div className="text-3xl font-mono font-bold text-gray-900">
                        {formatCurrency(data.total.recharged)}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-blue-500" /> Total Consumo (API)
                    </div>
                    <div className="text-3xl font-mono font-bold text-gray-900">
                        {formatCurrency(data.total.used)}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-500" /> Balance Neto (Pasivo)
                    </div>
                    <div className="text-3xl font-mono font-bold text-indigo-600">
                        {formatCurrency(data.total.recharged - data.total.used)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Dinero en carteras de usuarios</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    Actividad últimos 30 días
                </h3>

                <div className="h-64 flex items-end gap-2 sm:gap-4">
                    {data.daily.map((day: any) => (
                        <div key={day.date} className="flex-1 flex flex-col justify-end group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                                <div>{day.date}</div>
                                <div className="text-green-300">Recarga: {formatCurrency(day.recharge)}</div>
                                <div className="text-blue-300">Uso: {formatCurrency(day.usage)}</div>
                            </div>

                            {/* Bars */}
                            <div className="w-full bg-gray-100 rounded-t-sm flex items-end justify-center gap-[1px] h-full relative overflow-hidden">
                                {/* Recharge Bar */}
                                {day.recharge > 0 && (
                                    <div
                                        className="w-1/2 bg-green-500/80 hover:bg-green-500 transition-all rounded-t-sm"
                                        style={{ height: `${(day.recharge / maxVal) * 100}%` }}
                                    ></div>
                                )}
                                {/* Usage Bar */}
                                {day.usage > 0 && (
                                    <div
                                        className="w-1/2 bg-blue-500/80 hover:bg-blue-500 transition-all rounded-t-sm"
                                        style={{ height: `${(day.usage / maxVal) * 100}%` }}
                                    ></div>
                                )}
                            </div>

                            {/* Date Label */}
                            <div className="mt-2 text-[10px] sm:text-xs text-gray-400 text-center truncate w-full transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center">
                                {day.date.slice(8)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Recargas
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Consumo
                    </div>
                </div>
            </div>
        </div>
    );
}
