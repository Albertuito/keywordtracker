'use client';

import { useState } from 'react';
import { X, Search, Plus, Loader2, TrendingUp, DollarSign, AlertCircle, CheckCircle, Download, Sparkles, Target, FileText, HelpCircle, Lightbulb } from 'lucide-react';

interface KeywordIdea {
    keyword: string;
    volume: number;
    difficulty: number;
    intent: string;
    cpc: number;
    competition: number;
}

interface AIAnalysis {
    url_keywords: string[];
    title_keywords: string[];
    h2_keywords: string[];
    faq_questions: string[];
    content_gaps: string[];
    priority_ranking: Array<{ keyword: string; reason: string; priority: 'high' | 'medium' | 'low' }>;
    summary: string;
}

interface RelatedKeywordsModalProps {
    isOpen: boolean;
    onClose: () => void;
    seedKeyword: string;
    projectId: string;
    onAddKeywords: (keywords: string[]) => void;
}

export default function RelatedKeywordsModal({
    isOpen,
    onClose,
    seedKeyword,
    projectId,
    onAddKeywords
}: RelatedKeywordsModalProps) {
    const [loading, setLoading] = useState(false);
    const [keywords, setKeywords] = useState<KeywordIdea[]>([]);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
    const [activeTab, setActiveTab] = useState<'keywords' | 'analysis'>('keywords');

    if (!isOpen) return null;

    const showMessage = (text: string, type: 'error' | 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setMessage(null);
        try {
            const res = await fetch('/api/keywords/related', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: seedKeyword, limit: 50 })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) {
                    showMessage(`Saldo insuficiente. Necesitas €${data.required?.toFixed(2)}`, 'error');
                } else {
                    showMessage(data.error || 'Error al obtener keywords', 'error');
                }
                return;
            }

            setKeywords(data.keywords || []);
            setAnalysis(data.analysis || null);
            showMessage(`Encontradas ${data.count} keywords + Análisis IA`, 'success');
        } catch (error) {
            showMessage('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleKeyword = (kw: string) => {
        const newSelected = new Set(selectedKeywords);
        if (newSelected.has(kw)) {
            newSelected.delete(kw);
        } else {
            newSelected.add(kw);
        }
        setSelectedKeywords(newSelected);
    };

    const handleAddSelected = () => {
        if (selectedKeywords.size === 0) {
            showMessage('Selecciona al menos una keyword', 'error');
            return;
        }
        onAddKeywords(Array.from(selectedKeywords));
        showMessage(`${selectedKeywords.size} keywords añadidas al proyecto`, 'success');
        onClose();
    };

    const exportCSV = (exportSelected: boolean) => {
        const dataToExport = exportSelected
            ? keywords.filter(k => selectedKeywords.has(k.keyword))
            : keywords;

        if (dataToExport.length === 0) {
            showMessage('No hay keywords para exportar', 'error');
            return;
        }

        const headers = ['Keyword', 'Volumen', 'Dificultad', 'Intent', 'CPC', 'Competencia'];
        const rows = dataToExport.map(k => [
            k.keyword,
            k.volume,
            k.difficulty,
            k.intent,
            k.cpc.toFixed(2),
            k.competition
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `keywords_${seedKeyword.replace(/\s+/g, '_')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showMessage(`Exportadas ${dataToExport.length} keywords`, 'success');
    };

    const getIntentColor = (intent: string) => {
        switch (intent?.toLowerCase()) {
            case 'transactional': return 'text-green-600 bg-green-50';
            case 'commercial': return 'text-blue-600 bg-blue-50';
            case 'informational': return 'text-purple-600 bg-purple-50';
            case 'navigational': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getDifficultyColor = (diff: number) => {
        if (diff < 30) return 'text-green-600';
        if (diff < 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-green-100 text-green-700 border-green-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Keyword Intelligence
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Análisis para: <span className="font-semibold text-indigo-600">"{seedKeyword}"</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto max-h-[65vh]">
                    {!searched ? (
                        <div className="text-center py-16 px-6">
                            <Sparkles className="w-16 h-16 mx-auto text-indigo-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descubre oportunidades de keywords</h3>
                            <p className="text-gray-600 mb-2 max-w-md mx-auto">
                                Obtén keywords de calidad con dificultad SEO, intención de búsqueda, y recomendaciones IA personalizadas.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Coste: <span className="font-semibold text-indigo-600">€0.15</span> (DataForSEO Labs + GPT-4)
                            </p>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                Analizar Keywords (€0.15)
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-16">
                            <Loader2 className="w-12 h-12 mx-auto text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">Obteniendo keywords + Analizando con IA...</p>
                            <p className="text-sm text-gray-500 mt-1">Esto puede tardar 10-15 segundos</p>
                        </div>
                    ) : keywords.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-600">No se encontraron keywords relacionadas.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 px-6 pt-4">
                                <button
                                    onClick={() => setActiveTab('keywords')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'keywords' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <TrendingUp className="w-4 h-4 inline mr-1" />
                                    Keywords ({keywords.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('analysis')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Sparkles className="w-4 h-4 inline mr-1" />
                                    Análisis IA
                                </button>
                            </div>

                            {activeTab === 'keywords' && (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600">
                                            {keywords.length} keywords • {selectedKeywords.size} seleccionadas
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => exportCSV(false)}
                                                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                                            >
                                                <Download className="w-3 h-3" /> Exportar todas
                                            </button>
                                            {selectedKeywords.size > 0 && (
                                                <button
                                                    onClick={() => exportCSV(true)}
                                                    className="text-sm px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg flex items-center gap-1"
                                                >
                                                    <Download className="w-3 h-3" /> Exportar selección
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (selectedKeywords.size === keywords.length) {
                                                        setSelectedKeywords(new Set());
                                                    } else {
                                                        setSelectedKeywords(new Set(keywords.map(k => k.keyword)));
                                                    }
                                                }}
                                                className="text-sm text-indigo-600 hover:underline"
                                            >
                                                {selectedKeywords.size === keywords.length ? 'Deseleccionar' : 'Seleccionar todo'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr className="text-gray-700 text-xs uppercase tracking-wider">
                                                    <th className="py-3 px-4 text-left w-8"></th>
                                                    <th className="py-3 px-4 text-left">Keyword</th>
                                                    <th className="py-3 px-4 text-center">Volumen</th>
                                                    <th className="py-3 px-4 text-center">Dificultad</th>
                                                    <th className="py-3 px-4 text-center">Intención</th>
                                                    <th className="py-3 px-4 text-center">CPC</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {keywords.map((kw, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedKeywords.has(kw.keyword) ? 'bg-indigo-50' : ''}`}
                                                        onClick={() => toggleKeyword(kw.keyword)}
                                                    >
                                                        <td className="py-3 px-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedKeywords.has(kw.keyword)}
                                                                onChange={() => toggleKeyword(kw.keyword)}
                                                                className="rounded text-indigo-600"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-gray-900">
                                                            {kw.keyword}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-700">
                                                            {kw.volume?.toLocaleString() || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`font-semibold ${getDifficultyColor(kw.difficulty)}`}>
                                                                {kw.difficulty}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIntentColor(kw.intent)}`}>
                                                                {kw.intent || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-600">
                                                            €{kw.cpc?.toFixed(2) || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'analysis' && analysis && (
                                <div className="p-6 space-y-6">
                                    {/* Summary */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                        <h4 className="font-semibold text-indigo-900 flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4" /> Resumen Estratégico
                                        </h4>
                                        <p className="text-gray-700">{analysis.summary}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* URL Keywords */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                                <Target className="w-4 h-4 text-green-600" /> Keywords para URL
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.url_keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title Keywords */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                                <FileText className="w-4 h-4 text-blue-600" /> Keywords para Título
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.title_keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* H2 Keywords */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-purple-600" /> Keywords para H2
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.h2_keywords.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FAQ Questions */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                            <HelpCircle className="w-4 h-4 text-amber-600" /> Preguntas para FAQ
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.faq_questions.map((q, i) => (
                                                <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                                                    <span className="text-amber-500 font-bold">?</span>
                                                    {q}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Priority Ranking */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                            <Lightbulb className="w-4 h-4 text-yellow-600" /> Mejores Oportunidades
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.priority_ranking.map((item, i) => (
                                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(item.priority)}`}>
                                                    <div>
                                                        <span className="font-medium">{item.keyword}</span>
                                                        <p className="text-xs mt-0.5 opacity-80">{item.reason}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase`}>
                                                        {item.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content Gaps */}
                                    {analysis.content_gaps.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-4 h-4 text-indigo-600" /> Gaps de Contenido
                                            </h4>
                                            <ul className="space-y-1">
                                                {analysis.content_gaps.map((gap, i) => (
                                                    <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                                                        <span className="text-indigo-500">•</span>
                                                        {gap}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {keywords.length > 0 && (
                    <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-600">
                            {selectedKeywords.size} keywords seleccionadas
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handleAddSelected}
                                disabled={selectedKeywords.size === 0}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir al Proyecto
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
