'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { FileText, Calendar, Globe, ChevronRight, Trash2, Loader2, Search, Download, Sparkles, PenTool, X, Copy } from 'lucide-react';
import RelatedKeywordsModal from '@/components/RelatedKeywordsModal';
import { Toaster, toast as sonnerToast } from 'sonner';

interface Report {
    id: string;
    seedKeyword: string;
    country: string;
    createdAt: string;
    keywordCount: number;
    projectId?: string;
}

interface FullReport {
    id: string;
    seedKeyword: string;
    keywords: any[];
    analysis: any;
    country: string;
    createdAt: string;
}

interface GeneratedContent {
    id: string;
    keyword: string;
    country: string;
    content: string;
    wordCount: number;
    cost: number;
    createdAt: string;
}

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'keywords' | 'content'>('keywords');

    // Keywords Report State
    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
    const [loadingSpecificReport, setLoadingSpecificReport] = useState(false);

    // Generated Content State
    const [contents, setContents] = useState<GeneratedContent[]>([]);
    const [loadingContents, setLoadingContents] = useState(false);
    const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchReports();
            fetchGeneratedContent();
        }
    }, [status]);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoadingReports(false);
        }
    };

    const fetchGeneratedContent = async () => {
        setLoadingContents(true);
        try {
            const res = await fetch('/api/content-generator/history');
            const data = await res.json();
            if (Array.isArray(data)) {
                setContents(data);
            }
        } catch (error) {
            console.error('Error fetching content history:', error);
        } finally {
            setLoadingContents(false);
        }
    };

    const viewReport = async (id: string) => {
        setLoadingSpecificReport(true);
        try {
            const res = await fetch(`/api/reports?id=${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedReport(data.report);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoadingSpecificReport(false);
        }
    };

    const deleteReport = async (id: string) => {
        if (!confirm('¿Eliminar este reporte?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
                sonnerToast.success('Reporte eliminado');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            sonnerToast.error('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        sonnerToast.success('Contenido copiado al portapapeles');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        Historial y Reportes
                    </h1>
                    <p className="text-slate-300 mt-2">
                        Accede a tus análisis de keywords y contenido generado previamente.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-600 mb-8">
                    <button
                        onClick={() => setActiveTab('keywords')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'keywords'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Keyword Intelligence
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'content'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4" />
                            Contenido Generado
                        </div>
                    </button>
                </div>

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                    <>
                        {loadingReports ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-600 p-12 text-center">
                                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h2 className="text-xl font-semibold text-white mb-2">No tienes reportes de keywords</h2>
                                <p className="text-slate-300 mb-6">
                                    Genera tu primer análisis de Keyword Intelligence desde cualquier proyecto.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                >
                                    Ir a Proyectos
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-600 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-900 border-b border-slate-600">
                                        <tr className="text-slate-200 text-xs uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Keyword Base</th>
                                            <th className="py-4 px-6 text-center">Resultados</th>
                                            <th className="py-4 px-6 text-center">País</th>
                                            <th className="py-4 px-6 text-center">Fecha</th>
                                            <th className="py-4 px-6 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-900 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-white">{report.seedKeyword}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="px-2 py-1 bg-slate-700 text-slate-200 rounded-full text-sm font-medium">
                                                        {report.keywordCount}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-1 text-slate-300 uppercase text-sm">
                                                        <Globe className="w-3 h-3" />
                                                        {report.country}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center text-slate-400 text-sm">
                                                    {formatDate(report.createdAt)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => viewReport(report.id)}
                                                            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/20 flex items-center gap-1"
                                                        >
                                                            Ver <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteReport(report.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Generated Content Tab */}
                {activeTab === 'content' && (
                    <>
                        {loadingContents ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : contents.length === 0 ? (
                            <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-600 p-12 text-center">
                                <PenTool className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h2 className="text-xl font-semibold text-white mb-2">No tienes contenido generado</h2>
                                <p className="text-slate-300 mb-6">
                                    Crea contenido optimizado para SEO basado en ingeniería inversa de la competencia.
                                </p>
                                <button
                                    onClick={() => router.push('/content-generator')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Ir al Generador
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contents.map((item) => (
                                    <div key={item.id} className="bg-slate-800 rounded-xl shadow-sm border border-slate-600 hover:shadow-md transition-shadow flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                                                    {item.country === 'es' ? '🇪🇸 España' : item.country.toUpperCase()}
                                                </div>
                                                <span className="text-slate-500 text-xs">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                                                {item.keyword}
                                            </h3>
                                            <p className="text-slate-400 text-sm mb-4">
                                                {item.wordCount} palabras • €{item.cost?.toFixed(2)}
                                            </p>
                                            <div className="prose prose-sm line-clamp-3 text-slate-500 text-xs">
                                                <ReactMarkdown>{item.content.substring(0, 200)}</ReactMarkdown>
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center rounded-b-xl">
                                            <button
                                                onClick={() => setSelectedContent(item)}
                                                className="text-blue-400 font-medium text-sm hover:text-blue-800"
                                            >
                                                Ver completo
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(item.content)}
                                                className="text-slate-400 hover:text-slate-200"
                                                title="Copiar contenido"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Keyword Report Modal */}
            {selectedReport && (
                <RelatedKeywordsModal
                    isOpen={true}
                    onClose={() => setSelectedReport(null)}
                    seedKeyword={selectedReport.seedKeyword}
                    projectId=""
                    onAddKeywords={() => { }}
                    savedReport={selectedReport}
                />
            )}

            {/* Generated Content Modal */}
            {selectedContent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {selectedContent.keyword}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Generado el {new Date(selectedContent.createdAt).toLocaleString()} • {selectedContent.wordCount} palabras
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(selectedContent.content)}
                                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" /> Copiar
                                </button>
                                <button
                                    onClick={() => setSelectedContent(null)}
                                    className="p-2 hover:bg-gray-200 rounded-lg text-slate-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white prose-li:text-slate-300">
                                <ReactMarkdown>
                                    {selectedContent.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyword Report Modal */}
            {selectedReport && (
                <RelatedKeywordsModal
                    isOpen={true}
                    onClose={() => setSelectedReport(null)}
                    seedKeyword={selectedReport.seedKeyword}
                    projectId=""
                    onAddKeywords={() => { }}
                    savedReport={selectedReport}
                />
            )}

            {/* Keyword Loading Overlay */}
            {loadingSpecificReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-300">Cargando reporte...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
// End of ReportsPage


