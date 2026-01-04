'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2, UserCheck } from 'lucide-react';

interface Props {
    userId: string;
    userName: string;
    currentBalance: number;
}

export default function UserActions({ userId, userName, currentBalance }: Props) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBalanceChange = async (type: 'add' | 'deduct') => {
        const value = parseFloat(amount);
        if (!value || value <= 0) {
            setMessage({ type: 'error', text: 'Introduce una cantidad válida' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    amount: type === 'add' ? value : -value,
                    reason: reason || (type === 'add' ? 'Admin credit' : 'Admin deduction')
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Saldo ${type === 'add' ? 'añadido' : 'descontado'} correctamente. Recarga la página.` });
                setAmount('');
                setReason('');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Error' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async () => {
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                window.location.href = '/dashboard';
            } else {
                setMessage({ type: 'error', text: 'Error al impersonar usuario' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión' });
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                window.location.href = '/admin/users';
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Error al eliminar' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Balance Management */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Gestionar Saldo</h3>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Cantidad (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="10.00"
                            className="w-full px-3 py-2 border border-slate-500 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Motivo (opcional)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ej: Compensación soporte"
                            className="w-full px-3 py-2 border border-slate-500 rounded-lg"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => handleBalanceChange('add')}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir
                        </button>
                        <button
                            onClick={() => handleBalanceChange('deduct')}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Minus className="w-4 h-4" />
                            Descontar
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleImpersonate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                    <UserCheck className="w-4 h-4" />
                    Impersonar Usuario
                </button>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-slate-800 border border-red-300 text-red-400 rounded-lg hover:bg-red-500/20 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Usuario
                    </button>
                ) : (
                    <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-sm text-red-400">¿Seguro? Esta acción es irreversible.</span>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded border border-slate-500 hover:bg-slate-900"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

