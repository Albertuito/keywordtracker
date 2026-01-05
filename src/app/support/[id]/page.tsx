
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Send, User as UserIcon, Lock, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Message {
    id: string;
    message: string;
    createdAt: string;
    isAdmin: boolean;
    user: {
        name: string;
        email: string;
    };
}

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    messages: Message[];
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const isAdmin = session?.user?.email === 'infoinfolinfo@gmail.com';
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchTicket();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchTicket, 10000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            if (!res.ok) {
                if (res.status === 404) router.push('/support');
                return;
            }
            const data = await res.json();
            if (data.ticket) {
                setTicket(data.ticket);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage })
            });

            if (res.ok) {
                setNewMessage('');
                fetchTicket();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-700 p-4 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                                ticket.status === 'ANSWERED' ? 'bg-green-500/20 text-green-400' :
                                    'bg-slate-700 text-slate-400'
                                }`}>
                                {ticket.status === 'OPEN' ? 'Abierto' : ticket.status === 'ANSWERED' ? 'Respondido' : 'Cerrado'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Ticket #{ticket.id.slice(-6)} • Creado el {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded border ${ticket.priority === 'HIGH' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                            ticket.priority === 'MEDIUM' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                                'border-slate-500/30 text-slate-400 bg-slate-500/10'
                            }`}>
                            {ticket.priority} Priority
                        </span>

                        {isAdmin && (
                            <div className="flex gap-2 ml-4 border-l border-slate-700 pl-4">
                                <select
                                    value={ticket.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        // Update local state immediately
                                        setTicket(prev => prev ? { ...prev, status: newStatus } : null);
                                        // Call API
                                        await fetch('/api/admin/tickets', {
                                            method: 'PATCH',
                                            body: JSON.stringify({ id: ticket.id, status: newStatus })
                                        });
                                    }}
                                    className="bg-slate-800 text-xs text-white border border-slate-600 rounded px-2 py-1"
                                >
                                    <option value="OPEN">Abierto</option>
                                    <option value="ANSWERED">Respondido</option>
                                    <option value="CLOSED">Cerrado</option>
                                </select>
                                <select
                                    value={ticket.priority}
                                    onChange={async (e) => {
                                        const newPriority = e.target.value;
                                        setTicket(prev => prev ? { ...prev, priority: newPriority } : null);
                                        await fetch('/api/admin/tickets', {
                                            method: 'PATCH',
                                            body: JSON.stringify({ id: ticket.id, priority: newPriority })
                                        });
                                    }}
                                    className="bg-slate-800 text-xs text-white border border-slate-600 rounded px-2 py-1"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/50">
                {ticket.messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAdmin ? 'bg-blue-600' : 'bg-slate-700'
                            }`}>
                            {msg.isAdmin ? (
                                <Lock className="w-4 h-4 text-white" />
                            ) : (
                                <span className="text-xs font-bold text-white">Yo</span>
                            )}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-slate-300">
                                    {msg.isAdmin ? 'Soporte' : 'Tú'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className={`px-4 py-3 rounded-2xl text-sm ${msg.isAdmin ?
                                'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' :
                                'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-700 shrink-0">
                {ticket.status === 'CLOSED' ? (
                    <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <CheckCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400">Este ticket ha sido cerrado. Si necesitas más ayuda, crea uno nuevo.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Escribe tu mensaje..."
                            className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-[60px] max-h-[150px]"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
