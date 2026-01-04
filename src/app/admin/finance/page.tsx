
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/pricing';

interface FinanceData {
    chartData: {
        date: string;
        displayDate: string;
        revenue: number;
        cost: number;
        profit: number;
    }[];
    totals: {
        revenue: number;
        cost: number;
        profit: number;
    };
}

export default function FinancePage() {
    const [data, setData] = useState<FinanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');

    useEffect(() => {
        fetchFinanceData();
    }, [period]);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/finance?period=${period}`);
            const data = await res.json();
            setData(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    Finanzas & Beneficios
                </h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2"
                >
                    <option value="30days">Últimos 30 días</option>
                    <option value="year">Último año</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 font-medium">Ingresos Totales</span>
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(data.totals.revenue)}
                    </div>
                    <div className="text-sm text-slate-400">Recargas de saldo stripe</div>
                </div>

                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 font-medium">Costes API</span>
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatCurrency(data.totals.cost)}
                    </div>
                    <div className="text-sm text-slate-400">DataForSEO & AI Costs</div>
                </div>

                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-10 ${data.totals.profit >= 0 ? 'bg-gradient-to-br from-green-500 to-transparent' : 'bg-gradient-to-br from-red-500 to-transparent'}`}></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-slate-200 font-medium">Beneficio Neto</span>
                        <div className={`p-2 rounded-lg ${data.totals.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <DollarSign className={`w-5 h-5 ${data.totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 relative z-10 ${data.totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(data.totals.profit)}
                    </div>
                    <div className="text-sm text-slate-300 relative z-10">Ingresos - Costes</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Evolución Ingresos vs Costes</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="displayDate"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [`€${value.toFixed(2)}`, '']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Ingresos"
                                stroke="#22c55e"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                name="Costes"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorCost)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
