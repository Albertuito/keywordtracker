'use client';

import { useState } from 'react';
import { Send, Users, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AdminNotificationsPage() {
    const [isSending, setIsSending] = useState(false);
    const [form, setForm] = useState({
        title: '',
        message: '',
        type: 'info',
        targetUserId: 'ALL'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('¿Enviar notificación?')) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert('Notificación enviada');
                setForm({ ...form, title: '', message: '' });
            } else {
                alert('Error al enviar');
            }
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Send className="w-6 h-6 text-indigo-600" />
                Enviar Notificaciones
            </h2>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Target Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Destinatario</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, targetUserId: 'ALL' })}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${form.targetUserId === 'ALL'
                                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                                        : 'border-slate-600 hover:border-slate-500'
                                    }`}
                            >
                                <Users className="w-6 h-6" />
                                <span className="font-medium">Todos los Usuarios</span>
                            </button>
                            <div className="relative">
                                {/* Future: User Search/Select dropdown could go here. For now, simple ID input or ALL */}
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, targetUserId: '' })}
                                    className={`w-full h-full p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${form.targetUserId !== 'ALL'
                                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                                            : 'border-slate-600 hover:border-slate-500'
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <span className="font-medium">Usuario Específico</span>
                                </button>
                            </div>
                        </div>
                        {form.targetUserId !== 'ALL' && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="ID del Usuario"
                                    value={form.targetUserId}
                                    onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Tipo de Mensaje</label>
                        <div className="flex gap-4">
                            {['info', 'success', 'warning', 'error'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, type })}
                                    className={`px-4 py-2 rounded-lg capitalize border flex items-center gap-2 ${form.type === type
                                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                                            : 'border-slate-600 text-slate-300'
                                        }`}
                                >
                                    {type === 'info' && <Info className="w-4 h-4" />}
                                    {type === 'success' && <CheckCircle className="w-4 h-4" />}
                                    {type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Título</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Anuncio Importante"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Mensaje</label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg h-32"
                            placeholder="Escribe tu mensaje aquí..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSending}
                        className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {isSending ? 'Enviando...' : 'Enviar Notificación'}
                    </button>
                </form>
            </div>
        </div>
    );
}

