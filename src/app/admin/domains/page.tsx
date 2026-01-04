'use client';

import { useState, useEffect } from 'react';

interface DomainLock {
    id: string;
    domain: string;
    addedBy: string;
    userEmail: string;
    createdAt: string;
}

export default function DomainLocksPage() {
    const [locks, setLocks] = useState<DomainLock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchLocks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/domain-locks?search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setLocks(data);
            }
        } catch (error) {
            console.error('Error fetching locks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocks();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLocks();
    };

    const handleDelete = async (domain: string) => {
        if (!confirm(`¿Estás seguro de liberar el dominio "${domain}"?\n\nEsto permitirá que cualquier usuario lo registre.`)) {
            return;
        }

        setDeleting(domain);
        try {
            const res = await fetch(`/api/admin/domain-locks?domain=${encodeURIComponent(domain)}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setLocks(locks.filter(l => l.domain !== domain));
            } else {
                const data = await res.json();
                alert(data.error || 'Error al liberar dominio');
            }
        } catch (error) {
            console.error('Error deleting lock:', error);
            alert('Error de conexión');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Bloqueos de Dominio</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Gestiona los dominios bloqueados en el sistema. Libera un dominio para permitir que otro usuario lo registre.
                    </p>
                </div>
                <div className="text-sm text-slate-400">
                    {locks.length} dominio{locks.length !== 1 ? 's' : ''} bloqueado{locks.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <input
                    type="text"
                    placeholder="Buscar dominio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500/200 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                    Buscar
                </button>
            </form>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : locks.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-600">
                    <p className="text-slate-400">No hay dominios bloqueados</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-600 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900 border-b border-slate-600">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dominio</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Propietario</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha Bloqueo</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {locks.map((lock) => (
                                <tr key={lock.id} className="hover:bg-slate-900">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-white">{lock.domain}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-300">{lock.userEmail}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-400">
                                            {new Date(lock.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(lock.domain)}
                                            disabled={deleting === lock.domain}
                                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {deleting === lock.domain ? 'Liberando...' : 'Liberar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

