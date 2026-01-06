'use client';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KeywordData {
    id: string;
    term: string;
    positions: Array<{
        position: number;
        date: Date | string;
    }>;
}

interface RankingChartProps {
    keywords: KeywordData[];
    selectedKeywordIds: string[];
    height?: number;
    compact?: boolean;
    showStats?: boolean;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const DATE_RANGES: { value: DateRange; label: string; days: number | null }[] = [
    { value: '7d', label: '7 días', days: 7 },
    { value: '30d', label: '30 días', days: 30 },
    { value: '90d', label: '3 meses', days: 90 },
    { value: 'all', label: 'Todo', days: null },
];

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#f43f5e'];

export default function RankingChart({ keywords, selectedKeywordIds, height = 400, compact = false, showStats = true }: RankingChartProps) {
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    // Filter selected keywords
    const selectedKeywords = keywords.filter(k => selectedKeywordIds.includes(k.id));

    // Calculate date range
    const { startDate, dayCount } = useMemo(() => {
        const rangeConfig = DATE_RANGES.find(r => r.value === dateRange);
        const days = rangeConfig?.days;

        if (days === null) {
            // Find earliest date across all selected keywords
            let earliest = new Date();
            selectedKeywords.forEach(kw => {
                kw.positions.forEach(p => {
                    const d = new Date(p.date);
                    if (d < earliest) earliest = d;
                });
            });
            const diffTime = Math.abs(new Date().getTime() - earliest.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { startDate: earliest, dayCount: Math.max(diffDays, 7) };
        }

        const start = new Date();
        const daysToSubtract = days ?? 30;
        start.setDate(start.getDate() - daysToSubtract);
        return { startDate: start, dayCount: daysToSubtract };
    }, [dateRange, selectedKeywords]);

    if (selectedKeywords.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-600 rounded-xl">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-slate-300 text-lg font-medium">Selecciona keywords para ver su evolución</p>
                    <p className="text-slate-400 text-sm mt-2">Puedes comparar hasta 5 keywords simultáneamente</p>
                </div>
            </div>
        );
    }

    // Generate array of days for the range
    const today = new Date();
    const daysArray: Date[] = [];
    for (let i = dayCount - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        daysArray.push(date);
    }

    // Build chart data structure
    const chartData = daysArray.map(date => {
        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const dataPoint: any = { date: dateStr, fullDate: date };

        selectedKeywords.forEach(kw => {
            // Find position for this date
            const positionData = kw.positions.find(p => {
                const posDate = new Date(p.date);
                return posDate.toDateString() === date.toDateString();
            });

            dataPoint[kw.term] = positionData ? positionData.position : null;
        });

        return dataPoint;
    });

    // Decide tick interval based on data length
    const tickInterval = chartData.length > 60 ? Math.floor(chartData.length / 15) :
        chartData.length > 30 ? 3 : 1;

    return (
        <div className={`bg-slate-800 border border-slate-600 rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
            {!compact && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Evolución de Rankings</h3>
                        <p className="text-sm text-slate-400">
                            {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} •
                            {chartData.filter(d => selectedKeywords.some(kw => d[kw.term] !== null)).length} días con datos
                        </p>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex bg-slate-900 rounded-lg p-1">
                        {DATE_RANGES.map(range => (
                            <button
                                key={range.value}
                                onClick={() => setDateRange(range.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${dateRange === range.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={tickInterval}
                    />
                    <YAxis
                        reversed
                        domain={[1, 100]}
                        stroke="#64748b"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Posición', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '12px' } }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}
                        formatter={(value: number | null | undefined) => value != null ? [`Posición ${value}`, ''] : ['Sin datos', '']}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    {selectedKeywords.map((kw, index) => (
                        <Line
                            key={kw.id}
                            type="monotone"
                            dataKey={kw.term}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ fill: COLORS[index % COLORS.length], r: chartData.length > 60 ? 0 : 3 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-600">
                    {selectedKeywords.map((kw, index) => {
                        const positions = kw.positions.filter(p => p.position > 0).map(p => p.position);
                        if (positions.length === 0) return null;

                        const avgPosition = (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1);
                        const currentPosition = positions[0]; // First is most recent (desc order)
                        const previousPosition = positions.length > 1 ? positions[1] : currentPosition;
                        const change = previousPosition - currentPosition;

                        return (
                            <div key={kw.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <p className="text-sm font-medium text-slate-200 truncate">{kw.term}</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{currentPosition}</span>
                                    <span className="text-xs text-slate-400">posición actual</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className="text-slate-400">Promedio: {avgPosition}</span>
                                    {change !== 0 && (
                                        <span className={`flex items-center gap-1 font-semibold ${change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
