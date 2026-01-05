'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', domain: '', country: 'ES' });
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
        if (session) {
            fetch('/api/projects')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setProjects(data);
                })
                .catch(err => console.error("Error fetching projects", err));
        }
    }, [session, status, router]);

    const createProject = async () => {
        if (!newProject.name || !newProject.domain) return;
        setCreating(true);
        setError(''); // Clear previous errors
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            const data = await res.json();

            if (res.ok) {
                setProjects([...projects, data]);
                setShowAddModal(false);
                setNewProject({ name: '', domain: '', country: 'ES' });
                router.refresh();
            } else {
                // Show error message from API
                setError(data.error || 'Error al crear el proyecto');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setCreating(false);
        }
    };

    // Calculate stats
    const totalKeywords = projects.reduce((acc, p) => acc + (p.keywords?.length || 0), 0);

    // Get the most recent keyword update across all projects
    const getLatestUpdate = (): Date | null => {
        let latest: Date | null = null;
        projects.forEach(p => {
            p.keywords?.forEach((kw: any) => {
                if (kw.lastChecked) {
                    const kwDate = new Date(kw.lastChecked);
                    if (!latest || kwDate > latest) latest = kwDate;
                }
            });
        });
        return latest;
    };
    const latestUpdate = getLatestUpdate();

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400">Gestiona y monitoriza todos tus dominios desde un único lugar.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Proyecto
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Proyectos Activos</p>
                            <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Keywords Monitorizadas</p>
                            <p className="text-3xl font-bold text-white mt-1">{totalKeywords}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Última Actualización</p>
                            <p className="text-xl font-semibold text-white mt-1">
                                {latestUpdate ? latestUpdate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '--'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar proyecto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Projects Grid/Table */}
            {projects.length === 0 ? (
                // Empty State
                <div className="text-center py-16 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No hay proyectos todavía</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-6">
                        Empieza creando tu primer proyecto para monitorizar keywords y seguir tu posicionamiento.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary"
                    >
                        Crear mi primer proyecto
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900 border-b border-slate-700">
                        <div className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Proyecto</div>
                        <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dominio</div>
                        <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Keywords</div>
                        <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Act.</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Project Items */}
                    <div className="divide-y divide-slate-700">
                        {filteredProjects.map((proj) => (
                            <div
                                key={proj.id}
                                onClick={() => router.push(`/project?id=${proj.id}`)}
                                className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-700/50 transition-colors cursor-pointer"
                            >
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {proj.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{proj.name}</h3>
                                        <div className="md:hidden text-xs text-slate-400 mt-0.5">{proj.domain}</div>
                                    </div>
                                </div>

                                <div className="col-span-3 hidden md:flex items-center gap-2 text-sm text-slate-300">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <span className="font-mono text-sm">{proj.domain}</span>
                                </div>

                                <div className="col-span-2 hidden md:block">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-700 text-xs font-medium text-slate-300">
                                        {proj.keywords?.length || 0} keywords
                                    </span>
                                </div>

                                <div className="col-span-2 hidden md:block text-sm text-slate-400">
                                    {(() => {
                                        const kwDates = proj.keywords?.map((kw: any) => kw.lastChecked ? new Date(kw.lastChecked) : null).filter(Boolean) || [];
                                        const latest = kwDates.length > 0 ? new Date(Math.max(...kwDates.map((d: Date) => d.getTime()))) : null;
                                        return latest ? latest.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin datos';
                                    })()}
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <div className="p-2 text-slate-500 group-hover:text-blue-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Project Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative fade-in border border-slate-700">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-2">Nuevo Proyecto</h2>
                            <p className="text-sm text-slate-400">Añade un nuevo dominio para empezar a trackear.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Proyecto</label>
                                <input
                                    className="input-field"
                                    placeholder="Ej: Mi E-commerce"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Dominio (sin https://)</label>
                                <input
                                    className="input-field font-mono"
                                    placeholder="ej: tuweb.com"
                                    value={newProject.domain}
                                    onChange={e => setNewProject({ ...newProject, domain: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">País de posicionamiento</label>
                                <select
                                    className="input-field"
                                    value={newProject.country}
                                    onChange={e => setNewProject({ ...newProject, country: e.target.value })}
                                >
                                    <option value="ES">🇪🇸 España</option>
                                    <option value="MX">🇲🇽 México</option>
                                    <option value="AR">🇦🇷 Argentina</option>
                                    <option value="CO">🇨🇴 Colombia</option>
                                    <option value="CL">🇨🇱 Chile</option>
                                    <option value="PE">🇵🇪 Perú</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                    <option value="GB">🇬🇧 Reino Unido</option>
                                    <option value="FR">🇫🇷 Francia</option>
                                    <option value="DE">🇩🇪 Alemania</option>
                                    <option value="IT">🇮🇹 Italia</option>
                                    <option value="PT">🇵🇹 Portugal</option>
                                    <option value="BR">🇧🇷 Brasil</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Determina en qué país se consultarán los rankings de Google.</p>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    onClick={createProject}
                                    disabled={creating || !newProject.name || !newProject.domain}
                                    className="btn-primary w-full py-3 justify-center"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creando...
                                        </>
                                    ) : 'Crear Proyecto'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

