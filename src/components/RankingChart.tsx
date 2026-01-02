'use client';
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

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#f43f5e'];

export default function RankingChart({ keywords, selectedKeywordIds, height = 400, compact = false, showStats = true }: RankingChartProps) {
    // Filter selected keywords
    const selectedKeywords = keywords.filter(k => selectedKeywordIds.includes(k.id));

    if (selectedKeywords.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-white border border-gray-200 rounded-xl">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Selecciona keywords para ver su evolución</p>
                    <p className="text-gray-400 text-sm mt-2">Puedes comparar hasta 5 keywords simultáneamente</p>
                </div>
            </div>
        );
    }

    // Prepare chart data - Always show last 30 days
    const today = new Date();
    const last30Days: Date[] = [];

    // Generate array of last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push(date);
    }

    // Build chart data structure with all 30 days
    const chartData = last30Days.map(date => {
        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const dataPoint: any = { date: dateStr };

        selectedKeywords.forEach(kw => {
            // Find position for this date
            const positionData = kw.positions.find(p => {
                const posDate = new Date(p.date);
                // Compare dates (ignore time)
                return posDate.toDateString() === date.toDateString();
            });

            dataPoint[kw.term] = positionData ? positionData.position : null;
        });

        return dataPoint;
    });

    return (
        <div className={`bg-white border border-gray-200 rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
            {!compact && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolución de Rankings</h3>
                    <p className="text-sm text-gray-500">
                        Mostrando {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} •
                        Últimos {chartData.length} puntos de datos
                    </p>
                </div>
            )}

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        reversed
                        domain={[1, 100]}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Posición', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}
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
                            dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    {selectedKeywords.map((kw, index) => {
                        const positions = kw.positions.filter(p => p.position > 0).map(p => p.position);
                        if (positions.length === 0) return null;

                        const avgPosition = (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1);
                        const currentPosition = positions[positions.length - 1];
                        const previousPosition = positions.length > 1 ? positions[positions.length - 2] : currentPosition;
                        const change = previousPosition - currentPosition;

                        return (
                            <div key={kw.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <p className="text-sm font-medium text-gray-700 truncate">{kw.term}</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{currentPosition}</span>
                                    <span className="text-xs text-gray-500">posición actual</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className="text-gray-500">Promedio: {avgPosition}</span>
                                    {change !== 0 && (
                                        <span className={`flex items-center gap-1 font-semibold ${change > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
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
