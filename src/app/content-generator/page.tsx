'use client';

import { useState } from 'react';
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
    analysis: {
        strategicSynthesis: string;
        editorialDecision: string;
        qualityCheck: string;
    };
    cost: number;
}

export default function ContentGeneratorPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState('es');
    const [phase, setPhase] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
    const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
    const [generatedContent, setGeneratedContent] = useState<GenerationResult | null>(null);
    const [error, setError] = useState('');
    const [showAnalysis, setShowAnalysis] = useState(false);

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
            toast.success(`TOP ${data.results.length} analizado`);

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

            setGeneratedContent(data);
            setPhase('done');
            toast.success(`Contenido generado! Coste: €${data.cost.toFixed(2)}`);

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🎯 Ingeniería Inversa SEO
                    </h1>
                    <p className="text-gray-600">
                        Analiza el TOP 10 de Google y genera contenido diseñado para superarlos.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keyword objetivo
                            </label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="ej: mejores auriculares bluetooth"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                disabled={phase !== 'idle' && phase !== 'done'}
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                País
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${phase === 'analyzing' || phase === 'generating'
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {phase === 'analyzing' ? '🔍 Analizando...' :
                                    phase === 'generating' ? '✍️ Generando...' :
                                        '🚀 Generar contenido'}
                            </button>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        💰 Coste: <strong>€0.50</strong> por artículo generado
                    </p>
                </div>

                {/* Progress */}
                {(phase === 'analyzing' || phase === 'generating') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {phase === 'analyzing' ? 'Analizando TOP 10 de Google...' : 'Generando contenido competitivo...'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {phase === 'analyzing'
                                        ? 'Extrayendo datos de los primeros resultados'
                                        : 'Aplicando ingeniería inversa y redactando...'}
                                </p>
                            </div>
                        </div>
                        {phase === 'generating' && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span className="text-gray-600">Fase 1: Síntesis estratégica</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span className="text-gray-600">Fase 2: Decisión editorial</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm animate-pulse">
                                    <span className="text-blue-500">⏳</span>
                                    <span className="text-gray-600">Fase 3: Redacción del contenido</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>○</span>
                                    <span>Fase 4: Control de calidad</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Results */}
                {generatedContent && (
                    <div className="space-y-6">
                        {/* Analysis Toggle */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <button
                                onClick={() => setShowAnalysis(!showAnalysis)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                <svg className={`w-4 h-4 transition-transform ${showAnalysis ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                {showAnalysis ? 'Ocultar análisis intermedio' : 'Ver análisis intermedio'}
                            </button>

                            {showAnalysis && (
                                <div className="mt-4 space-y-4 text-sm">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">📊 Síntesis Estratégica</h4>
                                        <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40">
                                            {generatedContent.analysis.strategicSynthesis}
                                        </pre>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">📝 Decisión Editorial</h4>
                                        <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40">
                                            {generatedContent.analysis.editorialDecision}
                                        </pre>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">✅ Control de Calidad</h4>
                                        <pre className="whitespace-pre-wrap text-gray-600 text-xs">
                                            {generatedContent.analysis.qualityCheck}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generated Content */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">
                                    📄 Contenido generado para "{keyword}"
                                </h3>
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                                >
                                    📋 Copiar
                                </button>
                            </div>
                            <div className="p-6 prose prose-lg max-w-none">
                                <ReactMarkdown>
                                    {generatedContent.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
