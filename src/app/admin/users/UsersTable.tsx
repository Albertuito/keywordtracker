'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { User, Wallet, Edit, Trash2, Key, Shield, Calendar, FolderOpen } from 'lucide-react';

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date | string;
    lastLogin?: Date | string | null;
    balance?: {
        balance: number;
        totalSpent: number;
    } | null;
    _count?: {
        projects: number;
    };
}

export default function UsersTable({ users: initialUsers }: { users: UserData[] }) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [modalMode, setModalMode] = useState<'balance' | 'edit' | 'delete' | 'password' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit');
    const [editData, setEditData] = useState({ name: '', email: '', role: 'USER' });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const openBalanceModal = (user: UserData) => {
        setSelectedUser(user);
        setModalMode('balance');
        setBalanceAmount('');
        setMessage(null);
    };

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setEditData({ name: user.name || '', email: user.email || '', role: user.role });
        setModalMode('edit');
        setMessage(null);
    };

    const openDeleteModal = (user: UserData) => {
        setSelectedUser(user);
        setModalMode('delete');
        setMessage(null);
    };

    const openPasswordModal = (user: UserData) => {
        setSelectedUser(user);
        setModalMode('password');
        setNewPassword('');
        setConfirmPassword('');
        setMessage(null);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalMode(null);
        setMessage(null);
    };

    const handleBalanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    amount: parseFloat(balanceAmount),
                    type: balanceType
                })
            });
            if (res.ok) {
                router.refresh();
                closeModal();
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar saldo' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    data: editData
                })
            });
            if (res.ok) {
                router.refresh();
                closeModal();
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar usuario' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    newPassword
                })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
                setTimeout(() => closeModal(), 1500);
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedUser) return;
        if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.id })
            });
            if (res.ok) {
                router.refresh();
                closeModal();
            } else {
                setMessage({ type: 'error', text: 'Error al eliminar usuario' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-900 border-b border-slate-700">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Proyectos</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastado</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Último Login</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Registro</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {initialUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-900 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-700 rounded-lg">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.name || 'Sin Nombre'}</div>
                                            <div className="text-xs text-slate-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-200">{user._count?.projects || 0}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono font-medium text-green-400">
                                        {formatCurrency(user.balance?.balance || 0)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono text-slate-400">
                                        {formatCurrency(user.balance?.totalSpent || 0)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-200'
                                        : 'bg-slate-700 text-slate-300'
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Nunca'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => router.push(`/admin/users/${user.id}`)}
                                            title="Ver Detalles Completos"
                                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                        >
                                            <FolderOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openBalanceModal(user)}
                                            title="Gestionar Saldo"
                                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                        >
                                            <Wallet className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openPasswordModal(user)}
                                            title="Cambiar Contraseña"
                                            className="p-2 text-amber-600 hover:bg-amber-500/20 rounded-lg transition-colors"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            title="Editar Usuario"
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(user)}
                                            title="Eliminar Usuario"
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {modalMode && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-1">
                            {modalMode === 'balance' && 'Ajustar Saldo'}
                            {modalMode === 'edit' && 'Editar Usuario'}
                            {modalMode === 'delete' && 'Eliminar Usuario'}
                            {modalMode === 'password' && 'Cambiar Contraseña'}
                        </h3>

                        <div className="mb-6 text-sm text-slate-400">
                            Usuario: <strong className="text-white">{selectedUser.email}</strong>
                        </div>

                        {message && (
                            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {modalMode === 'balance' && (
                            <form onSubmit={handleBalanceSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Tipo de Ajuste</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setBalanceType('credit')}
                                            className={`flex-1 py-2.5 rounded-lg font-medium border-2 transition-all ${balanceType === 'credit'
                                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                                : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            + Añadir Crédito
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBalanceType('debit')}
                                            className={`flex-1 py-2.5 rounded-lg font-medium border-2 transition-all ${balanceType === 'debit'
                                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                                : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            − Deducir
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Cantidad (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                                        {isLoading ? 'Procesando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modalMode === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                                        {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modalMode === 'edit' && (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Rol</label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="USER">Usuario</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modalMode === 'delete' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">
                                        <strong>Atención:</strong> Esto eliminará permanentemente al usuario, sus proyectos, keywords e historial.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteSubmit}
                                        disabled={isLoading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

