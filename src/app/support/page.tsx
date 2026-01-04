
'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    messages: {
        message: string;
        createdAt: string;
    }[];
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'MEDIUM' });
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/tickets');
            const data = await res.json();
            if (data.tickets) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewTicket({ subject: '', message: '', priority: 'MEDIUM' });
                fetchTickets();
            } else {
                alert('Error al crear el ticket');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCreating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">Abierto</span>;
            case 'ANSWERED': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">Respondido</span>;
            case 'CLOSED': return <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-medium">Cerrado</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Soporte Técnico</h1>
                    <p className="text-slate-400">Gestiona tus consultas y reporta problemas</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No tienes tickets abiertos</h3>
                    <p className="text-slate-400 mb-6">Si tienes alguna duda o problema, crea un nuevo ticket.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                        Crear mi primer ticket →
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-700">
                        {tickets.map(ticket => (
                            <Link
                                key={ticket.id}
                                href={`/support/${ticket.id}`}
                                className="block p-4 hover:bg-slate-750 transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${ticket.status === 'ANSWERED' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {ticket.subject}
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                                                {ticket.messages[0]?.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className={`font-medium ${ticket.priority === 'HIGH' ? 'text-red-400' : ticket.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    {ticket.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(ticket.status)}
                                        <svg className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Nuevo Ticket de Soporte</h2>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Asunto</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Resumen breve del problema"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Prioridad</label>
                                <select
                                    value={newTicket.priority}
                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="LOW">Baja - Consulta general</option>
                                    <option value="MEDIUM">Media - Problema funcional</option>
                                    <option value="HIGH">Alta - Error crítico / Bloqueo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Mensaje</label>
                                <textarea
                                    required
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                    placeholder="Describe tu problema en detalle..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creating ? 'Enviando...' : 'Crear Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
