'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface SerpResult {
    position: number;
    url: string;
    domain: string;
    title: string;
    description: string;
}

interface GenerationResult {
    content: string;
    cost: number;
}

export default function ContentGeneratorPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState('es');
    const [phase, setPhase] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
    const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
    const [analyzingIndex, setAnalyzingIndex] = useState(0);
    const [generatedContent, setGeneratedContent] = useState<GenerationResult | null>(null);
    const [error, setError] = useState('');
    const [generationPhase, setGenerationPhase] = useState(0);

    // Simulate analyzing each result one by one
    useEffect(() => {
        if (phase === 'analyzing' && serpResults.length > 0 && analyzingIndex < serpResults.length) {
            const timer = setTimeout(() => {
                setAnalyzingIndex(prev => prev + 1);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [phase, serpResults.length, analyzingIndex]);

    // Simulate generation phases
    useEffect(() => {
        if (phase === 'generating' && generationPhase < 4) {
            const delays = [3000, 2500, 8000, 2000]; // Estimated time for each phase
            const timer = setTimeout(() => {
                setGenerationPhase(prev => prev + 1);
            }, delays[generationPhase] || 2000);
            return () => clearTimeout(timer);
        }
    }, [phase, generationPhase]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (!session) {
        router.push('/login');
        return null;
    }

    const handleAnalyze = async () => {
        if (!keyword.trim()) {
            toast.error('Introduce una keyword');
            return;
        }

        setError('');
        setPhase('analyzing');
        setSerpResults([]);
        setAnalyzingIndex(0);
        setGenerationPhase(0);
        setGeneratedContent(null);

        try {
            const res = await fetch('/api/content-generator/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: keyword.trim(), country, language: country })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al analizar SERP');
            }

            setSerpResults(data.results);

            // Wait a bit for the animation to complete
            await new Promise(resolve => setTimeout(resolve, data.results.length * 400 + 500));

            // Auto-continue to generation
            await handleGenerate(data.results);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setPhase('idle');
            toast.error(err.message);
        }
    };

    const handleGenerate = async (results: SerpResult[]) => {
        setPhase('generating');
        setGenerationPhase(0);

        try {
            const res = await fetch('/api/content-generator/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    serpResults: results,
                    country
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al generar contenido');
            }

            setGeneratedContent({ content: data.content, cost: data.cost });
            setPhase('done');
            setGenerationPhase(4);
            toast.success(`¡Contenido generado! Coste: €${data.cost.toFixed(2)}`);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setPhase('idle');
            toast.error(err.message);
        }
    };

    const copyToClipboard = () => {
        if (generatedContent?.content) {
            navigator.clipboard.writeText(generatedContent.content);
            toast.success('Contenido copiado al portapapeles');
        }
    };

    const phases = [
        { name: 'Detectando patrones del TOP 10', icon: '🔍' },
        { name: 'Identificando huecos de contenido', icon: '🎯' },
        { name: 'Redactando contenido competitivo', icon: '✍️' },
        { name: 'Verificando calidad final', icon: '✅' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                        <span className="animate-pulse">●</span> Tecnología de ingeniería inversa SEO
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        🎯 Genera contenido que <span className="text-blue-600">supera</span> al TOP 10
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Analizamos lo que funciona en Google y creamos contenido diseñado para competir y ganar.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Keyword objetivo
                            </label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="ej: mejores auriculares bluetooth"
                                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg"
                                disabled={phase !== 'idle' && phase !== 'done'}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                País
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                disabled={phase !== 'idle' && phase !== 'done'}
                            >
                                <option value="es">🇪🇸 España</option>
                                <option value="mx">🇲🇽 México</option>
                                <option value="ar">🇦🇷 Argentina</option>
                                <option value="us">🇺🇸 USA</option>
                                <option value="uk">🇬🇧 UK</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={phase === 'analyzing' || phase === 'generating'}
                                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${phase === 'analyzing' || phase === 'generating'
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                                    }`}
                            >
                                {phase === 'analyzing' ? '🔍 Analizando...' :
                                    phase === 'generating' ? '✍️ Generando...' :
                                        '🚀 Generar'}
                            </button>
                        </div>
                    </div>

                    {/* Value Proposition */}
                    <div className="border-t border-gray-100 pt-6">
                        <p className="text-sm font-medium text-gray-500 mb-4 text-center">¿Qué incluye la generación?</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                                <div className="text-2xl mb-2">🔍</div>
                                <p className="text-sm font-semibold text-gray-800">Análisis SERP</p>
                                <p className="text-xs text-gray-500 mt-1">TOP 10 en tiempo real</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                <div className="text-2xl mb-2">🎯</div>
                                <p className="text-sm font-semibold text-gray-800">Detección de huecos</p>
                                <p className="text-xs text-gray-500 mt-1">Lo que falta en otros</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                                <div className="text-2xl mb-2">✍️</div>
                                <p className="text-sm font-semibold text-gray-800">Redacción experta</p>
                                <p className="text-xs text-gray-500 mt-1">Contenido humano</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                                <div className="text-2xl mb-2">✅</div>
                                <p className="text-sm font-semibold text-gray-800">Control de calidad</p>
                                <p className="text-xs text-gray-500 mt-1">Verificación final</p>
                            </div>
                        </div>
                        <p className="text-center mt-4 text-sm text-gray-500">
                            💰 Coste total: <span className="font-bold text-gray-900">€0.50</span> por artículo completo
                        </p>
                    </div>
                </div>

                {/* Live SERP Analysis */}
                {phase === 'analyzing' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">🔍</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Analizando competencia en Google</p>
                                <p className="text-sm text-gray-500">Extrayendo estructura y patrones del TOP 10</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {serpResults.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${idx < analyzingIndex
                                        ? 'bg-green-50 border border-green-100'
                                        : idx === analyzingIndex
                                            ? 'bg-blue-50 border border-blue-200 animate-pulse'
                                            : 'bg-gray-50 border border-gray-100 opacity-50'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx < analyzingIndex
                                        ? 'bg-green-500 text-white'
                                        : idx === analyzingIndex
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {idx < analyzingIndex ? '✓' : idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{result.domain}</p>
                                    </div>
                                    {idx < analyzingIndex && (
                                        <span className="text-xs text-green-600 font-medium">Analizado</span>
                                    )}
                                    {idx === analyzingIndex && (
                                        <span className="text-xs text-blue-600 font-medium animate-pulse">Analizando...</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generation Progress */}
                {phase === 'generating' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">✍️</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Generando contenido competitivo</p>
                                <p className="text-sm text-gray-500">Aplicando ingeniería inversa al TOP 10</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {phases.map((p, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-500 ${idx < generationPhase
                                        ? 'bg-green-50 border border-green-100'
                                        : idx === generationPhase
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'bg-gray-50 border border-gray-100 opacity-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${idx < generationPhase
                                        ? 'bg-green-500 text-white'
                                        : idx === generationPhase
                                            ? 'bg-blue-500 text-white animate-pulse'
                                            : 'bg-gray-200'
                                        }`}>
                                        {idx < generationPhase ? '✓' : p.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${idx <= generationPhase ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {p.name}
                                        </p>
                                    </div>
                                    {idx < generationPhase && (
                                        <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">Completado</span>
                                    )}
                                    {idx === generationPhase && (
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-blue-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                            </div>
                                            <span className="text-xs text-blue-600 font-semibold">En proceso</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Generated Content */}
                {generatedContent && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">¡Contenido listo!</h3>
                                        <p className="text-green-100 text-sm">Optimizado para superar al TOP 10</p>
                                    </div>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-white font-semibold transition-all flex items-center gap-2"
                                >
                                    <span>📋</span> Copiar contenido
                                </button>
                            </div>
                        </div>
                        <div className="p-8 prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 prose-a:text-blue-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-img:rounded-xl">
                            <ReactMarkdown>
                                {generatedContent.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
