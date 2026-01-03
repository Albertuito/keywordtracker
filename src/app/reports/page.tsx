'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { FileText, Calendar, Globe, ChevronRight, Trash2, Loader2, Search, Download, Sparkles } from 'lucide-react';
import RelatedKeywordsModal from '@/components/RelatedKeywordsModal';

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
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
    const [loadingReport, setLoadingReport] = useState(false);
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
            setLoading(false);
        }
    };

    const viewReport = async (id: string) => {
        setLoadingReport(true);
        try {
            const res = await fetch(`/api/reports?id=${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedReport(data.report);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoadingReport(false);
        }
    };

    const deleteReport = async (id: string) => {
        if (!confirm('¿Eliminar este reporte?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Error deleting report:', error);
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

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        Mis Reportes de Keywords
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Accede a todos tus análisis de Keyword Intelligence anteriores
                    </p>
                </div>

                {reports.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes reportes aún</h2>
                        <p className="text-gray-600 mb-6">
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-gray-700 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-6 text-left">Keyword</th>
                                    <th className="py-4 px-6 text-center">Keywords</th>
                                    <th className="py-4 px-6 text-center">País</th>
                                    <th className="py-4 px-6 text-center">Fecha</th>
                                    <th className="py-4 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{report.seedKeyword}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                {report.keywordCount}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                <Globe className="w-4 h-4" />
                                                {report.country.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-gray-600 text-sm">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(report.createdAt)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => viewReport(report.id)}
                                                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-1"
                                                >
                                                    Ver <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteReport(report.id)}
                                                    disabled={deletingId === report.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Report Viewer Modal */}
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

            {loadingReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                        <p className="text-gray-600">Cargando reporte...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
