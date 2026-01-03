'use client';

import React, { useState } from 'react';
import { Search, Loader2, Target, Globe, ArrowRight } from 'lucide-react';

const COUNTRIES = [
    { code: 'es', name: 'España 🇪🇸' },
    { code: 'mx', name: 'México 🇲🇽' },
    { code: 'ar', name: 'Argentina 🇦🇷' },
    { code: 'co', name: 'Colombia 🇨🇴' },
    { code: 'cl', name: 'Chile 🇨🇱' },
    { code: 'pe', name: 'Perú 🇵🇪' },
];

export default function GapSniper() {
    const [topic, setTopic] = useState('');
    const [country, setCountry] = useState('es');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const res = await fetch('/api/research/gap-sniper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, country })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error buscando oportunidades');

            setResults(data.opportunities || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Target className="w-8 h-8 text-red-600" />
                    El Matagigantes (Forum Sniper)
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Encuentra keywords donde <strong>Foros y Webs Débiles</strong> (Reddit, Quora, Forocoches) están en el TOP 5.
                    <br />Si un foro rankea, ¡tú puedes superarlo con un buen artículo!
                </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Introduce tu nicho (ej: ayuno, freidoras, mecanica...)"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    <div className="w-full md:w-48 relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
                        >
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !topic}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center min-w-[140px] shadow-lg shadow-red-600/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Escanear'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6 text-center border border-red-100">
                    {error}
                </div>
            )}

            {results && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        Resultados encontrados: <span className="text-red-600 text-xl">{results.length}</span>
                    </h3>

                    {results.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No se encontraron "huecos" obvios en el Top 10 de keywords analizadas.</p>
                            <p className="text-sm text-gray-400 mt-1">Intenta con otro nicho más específico.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {results.map((opp, i) => (
                                <div key={i} className="p-5 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all bg-white group">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                {opp.keyword}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    📊 Vol: <strong className="text-gray-700">{opp.volume}</strong>
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${opp.difficulty < 30 ? 'bg-green-100 text-green-700' :
                                                        opp.difficulty < 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    KD: {opp.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 md:text-right">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Debilidad Detectada</p>
                                            <div className="space-y-2 flex flex-col items-start md:items-end">
                                                {opp.found_forums.map((f: any, j: number) => (
                                                    <a
                                                        key={j}
                                                        href={f.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <span className="font-bold">#{f.rank}</span>
                                                        <span className="capitalize">{f.domain.replace('.com', '').replace('www.', '')}</span>
                                                        <ArrowRight className="w-3 h-3 opacity-50" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
