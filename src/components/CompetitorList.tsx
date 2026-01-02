import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Globe, Target, TrendingUp, Eye, Award, ChevronDown, ChevronUp, Star, ExternalLink } from 'lucide-react';

interface Competitor {
    id: string;
    domain: string;
    isManual: boolean;
    keywordsInCommon: number;
    overlap: number;
    avgPosition: number | null;
    topKeywords: string[];
    createdAt?: string;
}

interface CompetitorListProps {
    projectId: string;
}

export default function CompetitorList({ projectId }: CompetitorListProps) {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState<any>(null);
    const [newDomain, setNewDomain] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showDetected, setShowDetected] = useState(true);

    useEffect(() => {
        if (projectId) fetchCompetitors();
    }, [projectId]);

    const fetchCompetitors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/competitors?projectId=${projectId}`);
            const data = await res.json();
            if (data.competitors) {
                setCompetitors(data.competitors);
                setMetadata(data.metadata);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addCompetitor = async () => {
        if (!newDomain.trim()) return;
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/competitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, domain: newDomain })
            });
            const data = await res.json();
            if (res.ok) {
                setNewDomain('');
                fetchCompetitors();
            } else {
                setError(data.error || 'Error al añadir competidor');
            }
        } catch (error) {
            console.error(error);
            setError('Error de conexión');
        } finally {
            setAdding(false);
        }
    };

    const deleteCompetitor = async (competitorId: string) => {
        try {
            const res = await fetch(`/api/competitors?id=${competitorId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCompetitors();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const manualCompetitors = competitors.filter(c => c.isManual);
    const detectedCompetitors = competitors.filter(c => !c.isManual);

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span>Analizando competencia...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Manual Competitors Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Star className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Mis Competidores</h3>
                                <p className="text-sm text-gray-500">Competidores que quieres monitorizar</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:w-64">
                                <input
                                    className="input-field w-full pr-20"
                                    placeholder="ejemplo.com"
                                    value={newDomain}
                                    onChange={(e) => { setNewDomain(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                                />
                            </div>
                            <button
                                onClick={addCompetitor}
                                disabled={adding || !newDomain.trim()}
                                className="btn-primary whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                {adding ? 'Añadiendo...' : 'Añadir'}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                {/* Manual Competitors Table */}
                {manualCompetitors.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Dominio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Keywords en Común
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Pos. Media Top 5
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Overlap
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {manualCompetitors.map((comp) => (
                                    <CompetitorRow
                                        key={comp.id}
                                        competitor={comp}
                                        onDelete={deleteCompetitor}
                                        expanded={expandedId === comp.id}
                                        onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                                        totalKeywords={metadata?.totalKeywords || 0}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Star className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">No hay competidores añadidos</p>
                                <p className="text-sm text-gray-400 mt-1">Añade dominios para monitorizar tu competencia directa</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detected Competitors Section */}
            {detectedCompetitors.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setShowDetected(!showDetected)}
                        className="w-full p-6 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">Competidores Detectados</h3>
                                <p className="text-sm text-gray-500">
                                    Dominios que aparecen en los resultados de tus keywords ({detectedCompetitors.length})
                                </p>
                            </div>
                        </div>
                        {showDetected ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {showDetected && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Dominio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Keywords en Común
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Pos. Media Top 5
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Overlap
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {detectedCompetitors.map((comp) => (
                                        <DetectedCompetitorRow
                                            key={comp.id}
                                            competitor={comp}
                                            expanded={expandedId === comp.id}
                                            onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                                            onAddToManual={async () => {
                                                setNewDomain(comp.domain);
                                                await new Promise(r => setTimeout(r, 100));
                                                const res = await fetch('/api/competitors', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ projectId, domain: comp.domain })
                                                });
                                                if (res.ok) {
                                                    setNewDomain('');
                                                    fetchCompetitors();
                                                }
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Summary Footer */}
            {metadata && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-6">
                            <span className="text-gray-500">
                                <span className="font-semibold text-gray-700">{metadata.manualCount}</span> competidores monitorizados
                            </span>
                            <span className="text-gray-500">
                                <span className="font-semibold text-gray-700">{metadata.detectedCount}</span> detectados automáticamente
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">
                                {metadata.totalKeywordsWithData}/{metadata.totalKeywords} keywords con datos
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Competitor Row Component
function CompetitorRow({
    competitor,
    onDelete,
    expanded,
    onToggle,
    totalKeywords
}: {
    competitor: Competitor;
    onDelete: (id: string) => void;
    expanded: boolean;
    onToggle: () => void;
    totalKeywords: number;
}) {
    return (
        <>
            <tr className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={onToggle} className="p-2 bg-gray-100 rounded-lg group-hover:bg-purple-50 transition-colors">
                            <Globe className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                        </button>
                        <div>
                            <span className="font-medium text-gray-900">{competitor.domain}</span>
                            {competitor.topKeywords.length > 0 && (
                                <button
                                    onClick={onToggle}
                                    className="ml-2 text-xs text-blue-500 hover:text-blue-600"
                                >
                                    {expanded ? 'Ocultar' : 'Ver keywords'}
                                </button>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {competitor.keywordsInCommon}
                        </span>
                        <span className="text-xs text-gray-400">/ {totalKeywords}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    {competitor.avgPosition !== null ? (
                        <span className={`font-medium ${competitor.avgPosition <= 2 ? 'text-green-600' : competitor.avgPosition <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            #{competitor.avgPosition}
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${competitor.overlap >= 50 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                        competitor.overlap >= 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                            'bg-gradient-to-r from-blue-500 to-blue-400'
                                    }`}
                                style={{ width: `${competitor.overlap}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium w-10">{competitor.overlap}%</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <a
                            href={`https://${competitor.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => onDelete(competitor.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {expanded && competitor.topKeywords.length > 0 && (
                <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Keywords en común: </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {competitor.topKeywords.map((kw, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// Detected Competitor Row
function DetectedCompetitorRow({
    competitor,
    expanded,
    onToggle,
    onAddToManual
}: {
    competitor: Competitor;
    expanded: boolean;
    onToggle: () => void;
    onAddToManual: () => void;
}) {
    return (
        <>
            <tr className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={onToggle} className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </button>
                        <div>
                            <span className="font-medium text-gray-700">{competitor.domain}</span>
                            {competitor.topKeywords.length > 0 && (
                                <button
                                    onClick={onToggle}
                                    className="ml-2 text-xs text-blue-500 hover:text-blue-600"
                                >
                                    {expanded ? 'Ocultar' : 'Ver keywords'}
                                </button>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {competitor.keywordsInCommon}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`font-medium ${competitor.avgPosition && competitor.avgPosition <= 2 ? 'text-green-600' : 'text-gray-600'}`}>
                        #{competitor.avgPosition}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-gray-400 to-gray-300 rounded-full"
                                style={{ width: `${competitor.overlap}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-500">{competitor.overlap}%</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <button
                        onClick={onAddToManual}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir
                    </button>
                </td>
            </tr>
            {expanded && competitor.topKeywords.length > 0 && (
                <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Keywords donde aparece: </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {competitor.topKeywords.map((kw, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
