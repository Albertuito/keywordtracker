'use client';

import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react';

export default function FreshnessTool() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/research/freshness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error en análisis');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">💎 Detector de Freshness Gap</h2>
                <p className="text-slate-400">
                    Encuentra nichos donde los resultados son antiguos y fáciles de superar con contenido actualizado.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="relative max-w-lg mx-auto mb-10">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Ej: mejores moviles 2020..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !keyword}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analizar'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-red-500/20 text-red-400 rounded-lg mb-6 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Card */}
                    <div className={`p-6 rounded-lg border-l-4 mb-8 flex items-start gap-4 ${result.is_opportunity ? 'bg-green-500/20 border-green-500' : 'bg-slate-900 border-slate-500'
                        }`}>
                        <div className={`p-3 rounded-full ${result.is_opportunity ? 'bg-green-100 text-green-400' : 'bg-gray-200 text-slate-400'}`}>
                            {result.is_opportunity ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${result.is_opportunity ? 'text-green-800' : 'text-slate-100'}`}>
                                {result.is_opportunity ? '¡Oportunidad Detectada!' : 'Sin hueco claro de Freshness'}
                            </h3>
                            <p className="text-sm mt-1 text-slate-300">
                                {result.is_opportunity
                                    ? `El ${result.freshness_score}% de los resultados detectados son antiguos. ¡Escribe contenido nuevo y rankea!`
                                    : "Los resultados parecen actuales. Será más difícil superarles solo por fecha."}
                            </p>
                            {result.top_result_is_old && (
                                <span className="inline-block mt-3 px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
                                    TOP 1 DESACTUALIZADO
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Results Grid */}
                    <h4 className="font-semibold text-white mb-4">Análisis del TOP 10:</h4>
                    <div className="space-y-3">
                        {result.results.map((item: any, i: number) => (
                            <div key={i} className={`p-4 rounded-lg border flex flex-col md:flex-row gap-4 justify-between items-start ${item.is_old ? 'bg-yellow-500/20 border-yellow-200' : 'bg-slate-800 border-slate-700'
                                }`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-slate-500">#{item.rank}</span>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-400 hover:underline line-clamp-1">
                                            {item.title}
                                        </a>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2">{item.snippet}</p>
                                </div>
                                <div className="min-w-[120px] flex items-center justify-end">
                                    {item.detected_year ? (
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${item.is_old ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-700 text-slate-300'
                                            }`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {item.detected_year}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500 italic">Sin fecha</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

