'use client';
import { useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectSummary from '@/components/ProjectSummary';
import CompetitorList from '@/components/CompetitorList';
import RankingChart from '@/components/RankingChart';
import FrequencyBadge, { FREQUENCY_CONFIG } from '@/components/FrequencyBadge';
import RelatedKeywordsModal from '@/components/RelatedKeywordsModal';
import { PRICING } from '@/lib/pricing';

function ProjectContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('id');

    const [project, setProject] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'rankings' | 'competitors' | 'autotracking'>('rankings');
    const [keywords, setKeywords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyword, setNewKeyword] = useState({ term: '', country: 'es', device: 'desktop' });
    const [checking, setChecking] = useState(false);
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
    const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>(null);
    const [compareKeywords, setCompareKeywords] = useState<string[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [fetchingVolume, setFetchingVolume] = useState<Set<string>>(new Set());
    const [showVolumeConfirm, setShowVolumeConfirm] = useState<{ keywordIds: string[], count: number, cost: number } | null>(null);
    const [showFrequencyModal, setShowFrequencyModal] = useState<{ keywordIds: string[] } | null>(null);
    const [showRankingConfirm, setShowRankingConfirm] = useState<{ keywordIds: string[], count: number, cost: number } | null>(null);
    const [updateMode, setUpdateMode] = useState<'queue' | 'live'>('queue');
    const [relatedModalKeyword, setRelatedModalKeyword] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        if (status === 'authenticated' && projectId) {
            fetchProjectData();
        }
    }, [status, projectId]);

    const fetchProjectData = async () => {
        if (!projectId) return;
        try {
            const [projRes, kwRes] = await Promise.all([
                fetch(`/api/projects?id=${projectId}`),
                fetch(`/api/keywords?projectId=${projectId}`)
            ]);

            const projData = await projRes.json();
            if (!projData.error) setProject(projData);

            const kwData = await kwRes.json();
            if (Array.isArray(kwData)) setKeywords(kwData);
        } catch (e) {
            console.error("Error loading data", e);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedKeywords(new Set(keywords.map(k => k.id)));
        } else {
            setSelectedKeywords(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const newSet = new Set(selectedKeywords);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedKeywords(newSet);
    };

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const addKeyword = async () => {
        if (!newKeyword.term || !projectId) return;
        setLoading(true);
        try {
            const terms = newKeyword.term.split('\n').filter(t => t.trim());
            for (const term of terms) {
                await fetch('/api/keywords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        term: term.trim(),
                        projectId,
                        country: 'es',
                        device: newKeyword.device
                    })
                });
            }
            await fetchProjectData();
            setNewKeyword({ term: '', country: 'es', device: 'desktop' });
            setShowAddModal(false);
            showToast('Keywords añadidas correctamente', 'success');
        } catch (error) {
            showToast('Error al añadir keywords', 'error');
        } finally {
            setLoading(false);
        }
    };

    const prepareRankingUpdate = () => {
        if (!projectId) return;
        const keywordIds = selectedKeywords.size > 0 ? Array.from(selectedKeywords) : keywords.map(k => k.id);
        const count = keywordIds.length;
        setUpdateMode('queue'); // Default to Standard
        const costPerKeyword = PRICING.keyword_check_standard;
        const cost = count * costPerKeyword;
        setShowRankingConfirm({ keywordIds, count, cost });
    };

    const runChecks = async () => {
        if (!projectId || !showRankingConfirm) return;
        const { keywordIds } = showRankingConfirm;
        setShowRankingConfirm(null);
        setChecking(true);
        try {
            const res = await fetch('/api/keywords/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywordIds,
                    mode: updateMode // 'queue' or 'live'
                })
            });

            const data = await res.json();
            if (data.success) {
                // Force refresh data after live update
                await fetchProjectData();
                // Refresh Global Balance
                window.dispatchEvent(new Event('balanceUpdated'));

                if (updateMode === 'live') {
                    const count = data.count || 0;
                    const failed = data.failed || 0;
                    if (count > 0) {
                        if (failed > 0) {
                            showToast(`${count} keywords actualizadas al instante. ${failed} fallaron (sin saldo o error).`, 'success');
                        } else {
                            showToast(`${count} keywords actualizadas al instante.`, 'success');
                        }
                    } else {
                        showToast(`No se pudieron actualizar keywords. Revisa tu saldo.`, 'error');
                    }
                } else {
                    const count = data.enqueued || 0;
                    if (count > 0) {
                        showToast(`Actualización en cola para ${count} keywords. Revisa en ~2 mins.`, 'success');
                    } else {
                        const debug = data.debug;
                        let reason = 'Razón desconocida';
                        if (debug) {
                            reason = `Encontradas: ${debug.found}, Pagables: ${debug.payable}, Sin Saldo: ${debug.skippedBalance}`;
                        }
                        showToast(`Se han procesado 0 keywords. (${reason})`, 'error');
                    }
                }
            } else {
                showToast('Error: ' + (data.error || 'Desconocido'), 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setChecking(false);
        }
    };

    // Auto-Sync mechanism (polite polling)
    // Checks for results every 30 seconds if page is open
    // [MODIFIED] Now just re-fetches data, does NOT trigger cron sync
    useEffect(() => {
        const checkUpdates = () => {
            // Only auto-reload if we have pending tasks
            if (keywords.some(k => k.dataforseoTaskId)) {
                fetchProjectData();
            }
        };

        const interval = setInterval(checkUpdates, 30000); // 30s
        return () => clearInterval(interval);
    }, [keywords]);


    const deleteKeywords = async () => {
        if (selectedKeywords.size === 0 || !projectId) return;
        if (!confirm('¿Estás seguro de que deseas eliminar estas keywords?')) return;

        try {
            const res = await fetch('/api/keywords', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywordIds: Array.from(selectedKeywords),
                    projectId
                })
            });

            if (res.ok) {
                await fetchProjectData();
                setSelectedKeywords(new Set());
                showToast('Keywords eliminadas', 'success');
            } else {
                showToast('Error al eliminar', 'error');
            }
        } catch (error) {
            showToast('Error eliminando keywords', 'error');
        }
    };

    const requestVolume = async (keywordIds: string[]) => {
        if (keywordIds.length === 0) return;
        const cost = keywordIds.length * 0.03;
        setShowVolumeConfirm({ keywordIds, count: keywordIds.length, cost });
    };

    const confirmVolumeRequest = async () => {
        if (!showVolumeConfirm) return;

        const { keywordIds } = showVolumeConfirm;
        setShowVolumeConfirm(null);
        setFetchingVolume(new Set(keywordIds));

        try {
            const res = await fetch('/api/keywords/volume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywordIds })
            });

            const data = await res.json();

            if (res.ok) {
                await fetchProjectData();
                window.dispatchEvent(new Event('balanceUpdated'));
                showToast(`Volumen obtenido para ${data.charged} keyword(s). Total: €${(data.charged * 0.03).toFixed(2)}`, 'success');
            } else {
                showToast(data.error || 'Error al obtener volumen', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setFetchingVolume(new Set());
        }
    };

    const changeFrequency = async (keywordIds: string[], frequency: string) => {
        try {
            const res = await fetch('/api/keywords/frequency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywordIds, frequency })
            });

            const data = await res.json();

            if (res.ok) {
                await fetchProjectData();
                showToast(`Frecuencia actualizada para ${data.updated} keyword(s)`, 'success');
                setShowFrequencyModal(null);
            } else {
                showToast(data.error || 'Error al cambiar frecuencia', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    };

    if (status === 'loading') return <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-900"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!session || !project) return <div className="p-8 text-center text-slate-300 bg-slate-900 min-h-screen">Cargando proyecto...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/20' : 'bg-red-900/90 text-red-100 border-red-500/20'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                            <button onClick={() => router.push('/')} className="hover:text-blue-400 transition-colors">Proyectos</button>
                            <span>/</span>
                            <span>Detalles</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{project.name} <span className="text-blue-500 text-lg font-normal opacity-50">(v2.0)</span></h1>
                        <p className="text-slate-400 text-sm font-mono">{project.domain}</p>
                    </div>
                </header>

                {/* KPI Summary */}
                <ProjectSummary keywords={keywords} />

                {/* Tabs & Toolbar Container */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    {/* Pill Tabs */}
                    <div className="flex p-1 bg-slate-800 border border-slate-600 rounded-lg">
                        <button
                            onClick={() => setActiveTab('rankings')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'rankings' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-gray-200' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Rankings
                        </button>
                        <button
                            onClick={() => setActiveTab('autotracking')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'autotracking' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-gray-200' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Auto-Tracking
                            {(() => {
                                const autoCount = keywords.filter(k => k.trackingFrequency && k.trackingFrequency !== 'manual').length;
                                return autoCount > 0 ? <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-700 rounded-full">{autoCount}</span> : null;
                            })()}
                        </button>
                        <button
                            onClick={() => setActiveTab('competitors')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'competitors' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-gray-200' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Competencia
                        </button>

                    </div>

                    {/* Actions */}
                    {activeTab === 'rankings' && (
                        <div className="flex gap-3">
                            <button
                                onClick={prepareRankingUpdate}
                                disabled={checking}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${checking ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-800 border-slate-500 text-slate-200 hover:bg-slate-700'}`}
                            >
                                {checking ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                )}
                                {checking ? 'Actualizando...' : 'Actualizar Rankings'}
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Añadir Keywords
                            </button>
                            {compareKeywords.length === 2 && (
                                <button
                                    onClick={() => setShowCompareModal(true)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    Comparar (2)
                                </button>
                            )}
                            {selectedKeywords.size > 0 && (() => {
                                const selectedKws = keywords.filter(k => selectedKeywords.has(k.id));
                                const withoutVolume = selectedKws.filter(k => k.volume === null || k.volume === undefined);
                                const count = withoutVolume.length;

                                if (count === 0) return null;

                                return (
                                    <button
                                        onClick={() => requestVolume(withoutVolume.map(k => k.id))}
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        Obtener Volumen ({count})
                                    </button>
                                );
                            })()}
                            {selectedKeywords.size > 0 && (
                                <button
                                    onClick={() => setShowFrequencyModal({ keywordIds: Array.from(selectedKeywords) })}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Cambiar Frecuencia ({selectedKeywords.size})
                                </button>
                            )}
                            {selectedKeywords.size > 0 && (
                                <button
                                    onClick={deleteKeywords}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Eliminar ({selectedKeywords.size})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Search Bar & Filters */}
                {activeTab === 'rankings' && (
                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder-slate-500"
                                    placeholder="Buscar keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <select
                                value={frequencyFilter}
                                onChange={(e) => setFrequencyFilter(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded-lg text-slate-200 text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-w-[180px]"
                            >
                                <option value="all">Frecuencia: Todas</option>
                                <option value="manual">⚙️ Manuales</option>
                                <option value="daily">📅 Diarias</option>
                                <option value="every_2_days">📆 Cada 2 días</option>
                                <option value="weekly">📊 Semanales</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'competitors' && (
                    <CompetitorList projectId={projectId!} />
                )}



                {activeTab === 'rankings' && (
                    /* Main Table Card */
                    <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-slate-600 text-xs uppercase font-medium text-slate-300 tracking-wider bg-slate-900">
                                        <th className="py-3 px-2 w-8 text-center border-r border-slate-700">
                                            <input
                                                type="checkbox"
                                                className="rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer"
                                                checked={keywords.length > 0 && keywords.every(k => selectedKeywords.has(k.id))}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="py-3 px-2 w-8 text-center border-r border-slate-700"></th>
                                        <th className="py-3 px-3 font-semibold border-r border-slate-700">Keyword</th>
                                        <th className="py-3 px-2 w-10 text-center font-semibold border-r border-slate-700" title="Comparar">⊕</th>
                                        <th className="py-3 px-2 w-10 text-center font-semibold border-r border-slate-700" title="Relacionadas">🔍</th>
                                        <th className="py-3 px-3 w-20 text-center font-semibold border-r border-slate-700">Vol.</th>
                                        <th className="py-3 px-3 w-24 text-center font-semibold border-r border-slate-700">Freq.</th>
                                        <th className="py-3 px-3 w-16 text-center font-semibold text-blue-400 border-r border-slate-700">Pos.</th>
                                        <th className="py-3 px-2 w-12 text-center font-semibold border-r border-slate-700">Δ</th>
                                        <th className="py-3 px-3 font-semibold border-r border-slate-700">URL</th>
                                        <th className="py-3 px-2 w-20 text-center font-semibold">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    {(() => {
                                        const filteredKeywords = keywords.filter(kw => {
                                            const matchesSearch = kw.term.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesFrequency = frequencyFilter === 'all' ||
                                                (frequencyFilter === 'manual' && (!kw.trackingFrequency || kw.trackingFrequency === 'manual')) ||
                                                kw.trackingFrequency === frequencyFilter;
                                            return matchesSearch && matchesFrequency;
                                        });

                                        if (filteredKeywords.length === 0) {
                                            return (
                                                <tr><td colSpan={8} className="py-20 text-center text-slate-600">
                                                    {searchTerm ? `No se encontraron keywords con "${searchTerm}"` : 'No hay keywords rastreadas aun. Añade algunas arriba.'}
                                                </td></tr>
                                            );
                                        }

                                        return filteredKeywords.map((kw, idx) => {
                                            const hasPositionData = kw.positions && kw.positions.length > 0;
                                            const currentPos = kw.positions?.[0]?.position ?? null;
                                            const prevPos = kw.positions?.[1]?.position ?? null;
                                            const change = prevPos !== null && prevPos > 0 && currentPos !== null && currentPos > 0 ? prevPos - currentPos : 0;
                                            const url = kw.positions?.[0]?.url || '';
                                            const isQueued = !!kw.dataforseoTaskId;
                                            const isExpanded = expandedKeywordId === kw.id;
                                            const isInCompare = compareKeywords.includes(kw.id);
                                            const hasHistory = kw.positions && kw.positions.length >= 1;
                                            const isAutoTracked = kw.trackingFrequency && kw.trackingFrequency !== 'manual';

                                            // Alternating row colors
                                            const rowBg = selectedKeywords.has(kw.id) ? 'bg-blue-500/20' :
                                                isInCompare ? 'bg-purple-500/20' :
                                                    idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900/50';

                                            return (
                                                <>
                                                    <tr key={kw.id} className={`border-b border-slate-700 hover:bg-blue-500/20/30 transition-colors ${rowBg}`}>
                                                        {/* Checkbox */}
                                                        <td className="py-3 px-2 text-center border-r border-slate-700" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                className="rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer"
                                                                checked={selectedKeywords.has(kw.id)}
                                                                onChange={() => handleSelectOne(kw.id)}
                                                            />
                                                        </td>
                                                        {/* Expand */}
                                                        <td className="py-3 px-2 text-center border-r border-slate-700">
                                                            <button
                                                                onClick={() => hasHistory && setExpandedKeywordId(isExpanded ? null : kw.id)}
                                                                className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${hasHistory ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700 cursor-pointer' : 'text-gray-300 cursor-default'}`}
                                                                title={hasHistory ? (isExpanded ? 'Ocultar' : 'Ver historial') : 'Sin datos'}
                                                            >
                                                                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                        {/* Keyword */}
                                                        <td className="py-3 px-3 border-r border-slate-700">
                                                            <span className={`font-medium text-white ${isAutoTracked ? 'border-l-2 border-green-400 pl-2' : ''}`}>{kw.term}</span>
                                                        </td>
                                                        {/* Compare button */}
                                                        <td className="py-3 px-2 text-center border-r border-slate-700">
                                                            <button
                                                                onClick={() => { isInCompare ? setCompareKeywords(prev => prev.filter(id => id !== kw.id)) : compareKeywords.length < 2 && setCompareKeywords(prev => [...prev, kw.id]); }}
                                                                disabled={!isInCompare && compareKeywords.length >= 2}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isInCompare ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-700 text-slate-400 hover:bg-purple-500/30 hover:text-purple-400'}`}
                                                                title={isInCompare ? 'Quitar de comparación' : 'Comparar'}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                            </button>
                                                        </td>
                                                        {/* Related button */}
                                                        <td className="py-3 px-2 text-center border-r border-slate-700">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setRelatedModalKeyword(kw.term); }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                                                title="Analizar keywords relacionadas"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                            </button>
                                                        </td>
                                                        {/* Volume */}
                                                        <td className="py-3 px-3 text-center text-slate-200 text-sm align-middle border-r border-slate-700">
                                                            {kw.volume !== null && kw.volume !== undefined ? (
                                                                <span className="text-slate-200 font-medium">{kw.volume.toLocaleString()}</span>
                                                            ) : fetchingVolume.has(kw.id) ? (
                                                                <span className="text-blue-400 text-xs">...</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => requestVolume([kw.id])}
                                                                    className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 hover:bg-indigo-200"
                                                                    title="€0.03"
                                                                >
                                                                    +
                                                                </button>
                                                            )}
                                                        </td>
                                                        {/* Frequency */}
                                                        <td className="py-3 px-2 text-center align-middle border-r border-slate-700">
                                                            <select
                                                                value={kw.trackingFrequency || 'manual'}
                                                                onChange={(e) => changeFrequency([kw.id], e.target.value)}
                                                                className="px-1 py-0.5 text-xs rounded bg-slate-900 border border-slate-600 text-slate-300 hover:bg-slate-700 focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="manual">Manual</option>
                                                                <option value="daily">Diaria</option>
                                                                <option value="every_2_days">2 días</option>
                                                                <option value="weekly">Semanal</option>
                                                            </select>
                                                        </td>
                                                        {/* Position */}
                                                        <td className="py-3 px-2 text-center align-middle border-r border-slate-700">
                                                            {isQueued ? (
                                                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse inline-block"></span>
                                                            ) : currentPos && currentPos > 0 ? (
                                                                <RankBadge rank={currentPos} hasData={hasPositionData} />
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                        {/* Change */}
                                                        <td className="py-3 px-2 text-center align-middle border-r border-slate-700">
                                                            {!isQueued && change !== 0 ? (
                                                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${change > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                                                                    {change > 0 ? '+' : ''}{change}
                                                                </span>
                                                            ) : <span className="text-slate-500 text-xs">sin cambio</span>}
                                                        </td>
                                                        {/* URL */}
                                                        <td className="py-3 px-3 text-sm text-slate-300 border-r border-slate-700">
                                                            {url ? (
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:underline truncate block"
                                                                    title={url}
                                                                >
                                                                    {url.replace(/https?:\/\/(www\.)?/, '').substring(0, 35)}
                                                                </a>
                                                            ) : <span className="text-slate-500">-</span>}
                                                        </td>
                                                        {/* Date */}
                                                        <td className="py-3 px-3 text-center text-xs text-slate-400">
                                                            {kw.positions?.[0] ? new Date(kw.positions[0].date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                        </td>
                                                    </tr>
                                                    {isExpanded && hasHistory && (
                                                        <tr key={`${kw.id}-chart`} className="bg-slate-900/50">
                                                            <td colSpan={11} className="p-6">
                                                                <RankingChart
                                                                    keywords={[kw]}
                                                                    selectedKeywordIds={[kw.id]}
                                                                    height={250}
                                                                    compact={true}
                                                                    showStats={false}
                                                                />
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        });
                                    })()}
                                </tbody >
                            </table>
                        </div>
                    </div>
                )
                }

                {/* Auto-Tracking Tab Content */}
                {
                    activeTab === 'autotracking' && (
                        <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-600">
                                <h3 className="text-lg font-semibold text-white">Resumen de Auto-Tracking</h3>
                                <p className="text-sm text-slate-300 mt-1">Keywords con actualización automática programada</p>
                            </div>

                            {(() => {
                                const dailyKws = keywords.filter(k => k.trackingFrequency === 'daily');
                                const every2DaysKws = keywords.filter(k => k.trackingFrequency === 'every_2_days');
                                const weeklyKws = keywords.filter(k => k.trackingFrequency === 'weekly');

                                const dailyCost = dailyKws.length * PRICING.keyword_check_standard * 30;
                                const every2DaysCost = every2DaysKws.length * PRICING.keyword_check_standard * 15;
                                const weeklyCost = weeklyKws.length * PRICING.keyword_check_standard * 4;
                                const totalMonthlyCost = dailyCost + every2DaysCost + weeklyCost;

                                const hasAnyAutoTracking = dailyKws.length > 0 || every2DaysKws.length > 0 || weeklyKws.length > 0;

                                if (!hasAnyAutoTracking) {
                                    return (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-white font-medium mb-2">Sin auto-tracking activo</h4>
                                            <p className="text-slate-400 text-sm mb-4">
                                                Activa el tracking automático en tus keywords para que se actualicen solas.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('rankings')}
                                                className="text-blue-400 hover:text-blue-400 text-sm font-medium"
                                            >
                                                Ir a Rankings →
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {/* Cost Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-900 border-b border-slate-600">
                                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                                                <div className="text-xs text-slate-300 uppercase tracking-wide mb-1">Diarias</div>
                                                <div className="text-2xl font-bold text-emerald-600">{dailyKws.length}</div>
                                                <div className="text-xs text-slate-300 mt-1">€{dailyCost.toFixed(2)}/mes</div>
                                            </div>
                                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                                                <div className="text-xs text-slate-300 uppercase tracking-wide mb-1">Cada 2 días</div>
                                                <div className="text-2xl font-bold text-blue-400">{every2DaysKws.length}</div>
                                                <div className="text-xs text-slate-300 mt-1">€{every2DaysCost.toFixed(2)}/mes</div>
                                            </div>
                                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                                                <div className="text-xs text-slate-300 uppercase tracking-wide mb-1">Semanales</div>
                                                <div className="text-2xl font-bold text-purple-600">{weeklyKws.length}</div>
                                                <div className="text-xs text-slate-300 mt-1">€{weeklyCost.toFixed(2)}/mes</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                                <div className="text-xs uppercase tracking-wide opacity-80 mb-1">Coste Total Mensual</div>
                                                <div className="text-3xl font-bold">€{totalMonthlyCost.toFixed(2)}</div>
                                                <div className="text-xs opacity-70 mt-1">~{(dailyKws.length * 30 + every2DaysKws.length * 15 + weeklyKws.length * 4)} updates</div>
                                            </div>
                                        </div>

                                        {/* Keywords Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-600 bg-slate-900">
                                                        <th className="py-3 px-6 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">Keyword</th>
                                                        <th className="py-3 px-6 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Frecuencia</th>
                                                        <th className="py-3 px-6 text-right text-xs font-semibold text-slate-200 uppercase tracking-wider">Coste/Mes</th>
                                                        <th className="py-3 px-6 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700">
                                                    {[...dailyKws, ...every2DaysKws, ...weeklyKws].map(kw => {
                                                        const freq = kw.trackingFrequency;
                                                        const updates = freq === 'daily' ? 30 : freq === 'every_2_days' ? 15 : 4;
                                                        const cost = updates * PRICING.keyword_check_standard;
                                                        const freqLabel = freq === 'daily' ? 'Diaria' : freq === 'every_2_days' ? 'Cada 2 días' : 'Semanal';
                                                        const freqColor = freq === 'daily' ? 'bg-emerald-500/20 text-emerald-700' :
                                                            freq === 'every_2_days' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400';

                                                        // Calculate time remaining until next update
                                                        const intervalMs = freq === 'daily' ? 24 * 60 * 60 * 1000 :
                                                            freq === 'every_2_days' ? 48 * 60 * 60 * 1000 :
                                                                7 * 24 * 60 * 60 * 1000;
                                                        const lastCheck = kw.lastAutoCheck ? new Date(kw.lastAutoCheck).getTime() : 0;
                                                        const nextCheck = lastCheck + intervalMs;
                                                        const now = Date.now();
                                                        const remainingMs = Math.max(0, nextCheck - now);

                                                        let timeRemaining = '';
                                                        if (remainingMs <= 0 || !kw.lastAutoCheck) {
                                                            timeRemaining = 'Pendiente';
                                                        } else {
                                                            const hours = Math.floor(remainingMs / (60 * 60 * 1000));
                                                            const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                                                            if (hours >= 24) {
                                                                const days = Math.floor(hours / 24);
                                                                timeRemaining = `${days}d ${hours % 24}h`;
                                                            } else if (hours > 0) {
                                                                timeRemaining = `${hours}h ${mins}m`;
                                                            } else {
                                                                timeRemaining = `${mins}m`;
                                                            }
                                                        }

                                                        return (
                                                            <tr key={kw.id} className="hover:bg-slate-900">
                                                                <td className="py-4 px-6">
                                                                    <span className="font-medium text-white">{kw.term}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${freqColor}`}>{freqLabel}</span>
                                                                        <span className={`text-xs ${remainingMs <= 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                                                                            {remainingMs <= 0 ? '⏳ ' : '⏱️ '}{timeRemaining}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6 text-right">
                                                                    <span className="font-mono text-slate-200">€{cost.toFixed(2)}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <button
                                                                        onClick={() => changeFrequency([kw.id], 'manual')}
                                                                        className="text-xs text-red-400 hover:text-red-400 hover:underline"
                                                                    >
                                                                        Desactivar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )
                }
            </div >

            {/* Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-500 w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
                            <h3 className="text-xl font-bold text-white mb-2">Añadir Keywords</h3>
                            <p className="text-slate-300 text-sm mb-6">Introduce una keyword por línea.</p>

                            <textarea
                                className="w-full h-40 bg-slate-900 border border-slate-500 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none font-mono placeholder-slate-500"
                                placeholder="keyword 1&#10;keyword 2&#10;keyword 3"
                                value={newKeyword.term}
                                onChange={e => setNewKeyword({ ...newKeyword, term: e.target.value })}
                            ></textarea>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium">Cancelar</button>
                                <button onClick={addKeyword} disabled={loading} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {loading ? 'Añadiendo...' : 'Añadir Keywords'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Comparison Modal */}
            {
                showCompareModal && compareKeywords.length === 2 && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-500 w-full max-w-5xl rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setShowCompareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">✕</button>
                            <h3 className="text-xl font-bold text-white mb-2">Comparación de Keywords</h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Comparando: {keywords.filter(k => compareKeywords.includes(k.id)).map(k => k.term).join(' vs ')}
                            </p>

                            <RankingChart
                                keywords={keywords.filter(k => compareKeywords.includes(k.id))}
                                selectedKeywordIds={compareKeywords}
                                height={400}
                                compact={false}
                                showStats={true}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCompareModal(false);
                                        setCompareKeywords([]);
                                    }}
                                    className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Volume Confirmation Modal */}
            {
                showVolumeConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-500 w-full max-w-md rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">Obtener Volumen de Búsqueda</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        ¿Deseas obtener el volumen de búsqueda para <span className="text-white font-semibold">{showVolumeConfirm.count} keyword{showVolumeConfirm.count > 1 ? 's' : ''}</span>?
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 text-sm">Coste por keyword:</span>
                                    <span className="text-white font-mono">€0.03</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                                    <span className="text-white font-semibold">Total:</span>
                                    <span className="text-blue-400 font-bold text-lg">€{showVolumeConfirm.cost.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
                                <p className="text-blue-300 text-xs flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>El volumen se guardará permanentemente. Solo pagas una vez por keyword.</span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowVolumeConfirm(null)}
                                    className="flex-1 px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium border border-slate-500 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmVolumeRequest}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Ranking Update Confirmation Modal */}
            {/* Ranking Update Confirmation Modal */}
            {
                showRankingConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-500 w-full max-w-md rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">Actualizar Rankings</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        ¿Deseas comprobar el ranking de <span className="text-white font-semibold">{showRankingConfirm.count} keyword{showRankingConfirm.count > 1 ? 's' : ''}</span>?
                                    </p>
                                </div>
                            </div>

                            {/* Mode Selection */}
                            <div className="flex flex-col gap-3 mb-6">
                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${updateMode === 'queue' ? 'bg-blue-500/20 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`} onClick={() => setUpdateMode('queue')}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${updateMode === 'queue' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                                            {updateMode === 'queue' && <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Estándar (Cola)</div>
                                            <div className="text-xs text-slate-400">Resultados en ~2-5 minutos</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm text-slate-200">€{PRICING.keyword_check_standard.toFixed(2)}/kw</div>
                                </label>

                                <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${updateMode === 'live' ? 'bg-indigo-500/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`} onClick={() => setUpdateMode('live')}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${updateMode === 'live' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                                            {updateMode === 'live' && <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-indigo-900 flex items-center gap-2">
                                                Modo Rápido (Live)
                                                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded-full uppercase tracking-wider font-bold">⚡ Rápido</span>
                                            </div>
                                            <div className="text-xs text-indigo-600">Actualización en tiempo real</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm text-indigo-400 font-bold">€{PRICING.keyword_check_live.toFixed(2)}/kw</div>
                                </label>
                            </div>

                            <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-white font-semibold">Total a descontar:</span>
                                    <span className="text-blue-400 font-bold text-lg">
                                        €{((showRankingConfirm.count * (updateMode === 'queue' ? PRICING.keyword_check_standard : PRICING.keyword_check_live))).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRankingConfirm(null)}
                                    className="flex-1 px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium border border-slate-500 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={runChecks}
                                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Confirmar y Actualizar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Frequency Change Modal */}
            {
                showFrequencyModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-500 w-full max-w-md rounded-xl shadow-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Cambiar Frecuencia de Tracking</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Configurando {showFrequencyModal.keywordIds.length} keyword(s):
                            </p>

                            {/* Cost Warning */}
                            <div className="bg-amber-500/20 border border-amber-200 rounded-lg p-3 mb-5">
                                <p className="text-amber-800 text-xs font-medium flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>El auto-tracking descuenta automáticamente de tu saldo cada vez que se actualizan las keywords.</span>
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {/* Manual - No cost */}
                                <button
                                    onClick={() => changeFrequency(showFrequencyModal.keywordIds, 'manual')}
                                    className="w-full px-4 py-3 rounded-lg text-left transition-all border bg-slate-900 border-slate-600 hover:bg-slate-700"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⚙️</span>
                                            <div>
                                                <div className="font-semibold text-white">Manual</div>
                                                <div className="text-xs text-slate-400">Solo actualiza cuando tú lo pidas</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">Sin coste automático</span>
                                    </div>
                                </button>

                                {/* Daily */}
                                <button
                                    onClick={() => changeFrequency(showFrequencyModal.keywordIds, 'daily')}
                                    className="w-full px-4 py-3 rounded-lg text-left transition-all border bg-emerald-50 border-emerald-200 hover:bg-emerald-500/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📅</span>
                                            <div>
                                                <div className="font-semibold text-emerald-900">Diaria</div>
                                                <div className="text-xs text-emerald-700">Actualiza cada 24 horas</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-emerald-700">€{(showFrequencyModal.keywordIds.length * PRICING.keyword_check_standard * 30).toFixed(2)}/mes</div>
                                            <div className="text-xs text-emerald-600">~30 updates</div>
                                        </div>
                                    </div>
                                </button>

                                {/* Every 2 days */}
                                <button
                                    onClick={() => changeFrequency(showFrequencyModal.keywordIds, 'every_2_days')}
                                    className="w-full px-4 py-3 rounded-lg text-left transition-all border bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📆</span>
                                            <div>
                                                <div className="font-semibold text-blue-900">Cada 2 días</div>
                                                <div className="text-xs text-blue-400">Actualiza cada 48 horas</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-blue-400">€{(showFrequencyModal.keywordIds.length * PRICING.keyword_check_standard * 15).toFixed(2)}/mes</div>
                                            <div className="text-xs text-blue-400">~15 updates</div>
                                        </div>
                                    </div>
                                </button>

                                {/* Weekly */}
                                <button
                                    onClick={() => changeFrequency(showFrequencyModal.keywordIds, 'weekly')}
                                    className="w-full px-4 py-3 rounded-lg text-left transition-all border bg-purple-500/20 border-purple-200 hover:bg-purple-500/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📊</span>
                                            <div>
                                                <div className="font-semibold text-purple-900">Semanal</div>
                                                <div className="text-xs text-purple-400">Actualiza cada 7 días</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-purple-400">€{(showFrequencyModal.keywordIds.length * PRICING.keyword_check_standard * 4).toFixed(2)}/mes</div>
                                            <div className="text-xs text-purple-600">~4 updates</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="text-xs text-slate-400 mb-4 text-center">
                                Coste por actualización: €{PRICING.keyword_check_standard.toFixed(2)} × {showFrequencyModal.keywordIds.length} keyword(s) = €{(showFrequencyModal.keywordIds.length * PRICING.keyword_check_standard).toFixed(2)}
                            </div>

                            <button
                                onClick={() => setShowFrequencyModal(null)}
                                className="w-full px-4 py-2 text-slate-300 hover:text-white text-sm font-medium border border-slate-500 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Related Keywords Modal */}
            {
                relatedModalKeyword && projectId && (
                    <RelatedKeywordsModal
                        isOpen={!!relatedModalKeyword}
                        onClose={() => setRelatedModalKeyword(null)}
                        seedKeyword={relatedModalKeyword}
                        projectId={projectId}
                        onAddKeywords={async (keywordTerms) => {
                            // Add keywords to project
                            try {
                                for (const term of keywordTerms) {
                                    await fetch('/api/keywords', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            projectId,
                                            term,
                                            country: 'es',
                                            device: 'desktop'
                                        })
                                    });
                                }
                                fetchProjectData();
                            } catch (err) {
                                console.error('Error adding keywords:', err);
                            }
                        }}
                    />
                )
            }
        </div >
    );
}

function RankBadge({ rank, hasData = true }: { rank: number | null, hasData?: boolean }) {
    // No data yet (never checked)
    if (!hasData || rank === null) {
        return <span className="text-slate-500 text-xs">Nuevo</span>;
    }

    // Checked but not found in top 100
    if (rank === 0 || rank <= 0) {
        return (
            <div className="px-2 py-1 mx-auto bg-slate-700 text-slate-400 text-xs font-medium rounded-md border border-slate-600" title="No encontrada en top 100">
                +100
            </div>
        );
    }

    // Has position
    let color = 'bg-slate-700 text-slate-300 border-slate-500';
    if (rank <= 3) color = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
    else if (rank <= 10) color = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    else if (rank <= 30) color = 'bg-slate-700 text-slate-200 border-slate-500';

    return (
        <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-sm font-bold border ${color}`}>
            {rank}
        </div>
    )
}

export default function ProjectDetail() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen bg-slate-900"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <ProjectContent />
        </Suspense>
    );
}

