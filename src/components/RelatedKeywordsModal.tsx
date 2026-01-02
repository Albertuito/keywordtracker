'use client';

import { useState } from 'react';
import { X, Search, Plus, Loader2, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface RelatedKeyword {
    keyword: string;
    volume: number;
    competition: string;
    cpc: number;
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
    const [results, setResults] = useState<RelatedKeyword[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

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
                body: JSON.stringify({ keyword: seedKeyword, limit: 100 })
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

            setResults(data.results || []);
            showMessage(`Encontradas ${data.count} keywords relacionadas`, 'success');
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

    const getCompetitionColor = (comp: string) => {
        switch (comp?.toUpperCase()) {
            case 'LOW': return 'text-green-600 bg-green-50';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50';
            case 'HIGH': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Keywords Relacionadas</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Buscar keywords relacionadas con: <span className="font-semibold text-indigo-600">"{seedKeyword}"</span>
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
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {!searched ? (
                        <div className="text-center py-12">
                            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600 mb-4">
                                Pulsa buscar para obtener keywords relacionadas con tu término.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Coste: <span className="font-semibold text-indigo-600">€0.10</span> por búsqueda
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
                                Buscar Keywords (€0.10)
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 mx-auto text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-600">Buscando keywords relacionadas...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No se encontraron keywords relacionadas.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">
                                    {results.length} keywords encontradas • {selectedKeywords.size} seleccionadas
                                </p>
                                <button
                                    onClick={() => {
                                        if (selectedKeywords.size === results.length) {
                                            setSelectedKeywords(new Set());
                                        } else {
                                            setSelectedKeywords(new Set(results.map(r => r.keyword)));
                                        }
                                    }}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    {selectedKeywords.size === results.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr className="text-gray-700 text-xs uppercase tracking-wider">
                                            <th className="py-3 px-4 text-left w-8"></th>
                                            <th className="py-3 px-4 text-left">Keyword</th>
                                            <th className="py-3 px-4 text-center">Volumen</th>
                                            <th className="py-3 px-4 text-center">Competencia</th>
                                            <th className="py-3 px-4 text-center">CPC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {results.map((kw, idx) => (
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
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-700">
                                                        <TrendingUp className="w-3 h-3" />
                                                        {kw.volume?.toLocaleString() || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCompetitionColor(kw.competition)}`}>
                                                        {kw.competition || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-600">
                                                        <DollarSign className="w-3 h-3" />
                                                        {kw.cpc?.toFixed(2) || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-600">
                            {selectedKeywords.size} keywords seleccionadas para añadir
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
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
