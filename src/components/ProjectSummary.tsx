import { Keyword, KeywordPosition } from "@prisma/client";

interface KeywordWithPositions extends Keyword {
    positions: KeywordPosition[];
}

interface ProjectSummaryProps {
    keywords: KeywordWithPositions[];
}

export default function ProjectSummary({ keywords }: ProjectSummaryProps) {
    if (!keywords || keywords.length === 0) return null;

    // Calculate Stats
    let totalKeywords = keywords.length;
    let top3 = 0;
    let top10 = 0;
    let winners = 0;
    let losers = 0;
    let totalPos = 0;
    let rankedCount = 0;
    let unchanged = 0;
    let changedCount = 0;
    let totalChange = 0;

    keywords.forEach(kw => {
        const currentPos = kw.positions[0]?.position || 0;
        const prevPos = kw.positions[1]?.position || 0;

        // Valid Rank
        if (currentPos > 0) {
            if (currentPos <= 3) top3++;
            if (currentPos <= 10) top10++;
            totalPos += currentPos;
            rankedCount++;
        }

        // Change Status (Lower is better in rank)
        if (currentPos > 0 && prevPos > 0) {
            const change = prevPos - currentPos; // Positive means improved (e.g. 10 -> 5 = 5)
            if (change !== 0) {
                if (change > 0) winners++;
                else losers++;
                totalChange += change;
                changedCount++;
            } else {
                unchanged++;
            }
        } else if (currentPos > 0 && prevPos === 0) {
            winners++;
            // Treat new ranking as improvement? Or neutral. Let's count as winner but no change val
        }
    });

    const avgPos = rankedCount > 0 ? (totalPos / rankedCount).toFixed(1) : '-';
    // Average change among those that changed
    const avgChange = changedCount > 0 ? (totalChange / changedCount) : 0;


    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
                title="Posición Media"
                value={avgPos}
                subtitle={`de ${rankedCount} keywords`}
                icon={<svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />

            <SummaryCard
                title="Visibilidad"
                value={`${top3 + top10}`}
                subtitle={
                    <div className="flex gap-3 text-xs">
                        <span className="text-emerald-400 font-medium">Top 3: {top3}</span>
                        <span className="text-blue-400 font-medium">Top 10: {top10}</span>
                    </div>
                }
                icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            />

            <SummaryCard
                title="Movimientos"
                value={
                    <div className="flex items-center gap-3">
                        <span className="text-emerald-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            {winners}
                        </span>
                        <span className="text-rose-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                            {losers}
                        </span>
                    </div>
                }
                subtitle={`${unchanged} sin cambios`}
                icon={<svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />

            <SummaryCard
                title="Total Keywords"
                value={totalKeywords}
                subtitle="Rastreadas activamente"
                icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
            />
        </div>
    );
}

function SummaryCard({ title, value, subtitle, icon }: { title: string, value: any, subtitle: any, icon: any }) {
    return (
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 shadow-sm hover:border-slate-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <span className="text-slate-200 text-sm font-medium">{title}</span>
                <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                    {icon}
                </div>
            </div>
            <div className="flex flex-col">
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-sm text-slate-300 mt-2 font-medium">{subtitle}</div>
            </div>
        </div>
    );
}

