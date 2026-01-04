
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Filter, RefreshCw, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface AdminTicket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    user: {
        name: string;
        email: string;
    };
    messages: {
        message: string;
    }[];
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?status=${filterStatus}`);
            const data = await res.json();
            if (data.tickets) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-500/20 text-blue-400';
            case 'ANSWERED': return 'bg-green-500/20 text-green-400';
            case 'CLOSED': return 'bg-slate-700 text-slate-400';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    Tickets de Soporte
                </h1>
                <div className="flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 outline-none"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="OPEN">Abiertos</option>
                        <option value="ANSWERED">Respondidos</option>
                        <option value="CLOSED">Cerrados</option>
                    </select>
                    <button
                        onClick={() => fetchTickets()}
                        className="p-2 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 text-white"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 text-sm">
                        <tr>
                            <th className="px-6 py-3 font-medium">Asunto</th>
                            <th className="px-6 py-3 font-medium">Usuario</th>
                            <th className="px-6 py-3 font-medium">Estado</th>
                            <th className="px-6 py-3 font-medium">Prioridad</th>
                            <th className="px-6 py-3 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {loading && tickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Cargando tickets...
                                </td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    No hay tickets para mostrar
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-750 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{ticket.subject}</span>
                                            <span className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-md">
                                                {ticket.messages[0]?.message}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                {ticket.user.name?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-200">{ticket.user.name || 'Sin nombre'}</span>
                                                <span className="text-xs text-slate-500">{ticket.user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status === 'OPEN' ? 'Abierto' : ticket.status === 'ANSWERED' ? 'Respondido' : 'Cerrado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs ${ticket.priority === 'HIGH' ? 'text-red-400 font-bold' :
                                                ticket.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/support/${ticket.id}`}
                                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                        >
                                            Ver Chat →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
