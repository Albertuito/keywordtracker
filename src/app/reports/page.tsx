'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { FileText, Calendar, Globe, ChevronRight, Trash2, Loader2, Search, Sparkles } from 'lucide-react';
import RelatedKeywordsModal from '@/components/RelatedKeywordsModal';
import { toast as sonnerToast } from 'sonner';

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

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
    const [loadingSpecificReport, setLoadingSpecificReport] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchReports();
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                        Keyword Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Historial de tus análisis de palabras clave relacionadas.
                    </p>
                </div>

                {loadingReports ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-12 text-center">
                        <Search className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No tienes reportes de keywords</h2>
                        <p className="text-slate-400 mb-6">
                            Genera tu primer análisis de Keyword Intelligence desde cualquier proyecto.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                        >
                            Ir a Proyectos
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900 border-b border-slate-700">
                                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-6 text-left">Keyword Base</th>
                                    <th className="py-4 px-6 text-center">Resultados</th>
                                    <th className="py-4 px-6 text-center">País</th>
                                    <th className="py-4 px-6 text-center">Fecha</th>
                                    <th className="py-4 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-white">{report.seedKeyword}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
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
                                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 flex items-center gap-1 transition-colors"
                                                >
                                                    Ver <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteReport(report.id)}
                                                    disabled={deletingId === report.id}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === report.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

            {/* Loading Overlay */}
            {loadingSpecificReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center border border-slate-700">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-300">Cargando reporte...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
