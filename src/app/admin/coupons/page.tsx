'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Ticket } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

interface Coupon {
    id: string;
    code: string;
    amount: number;
    maxUses: number;
    usedCount: number;
    active: boolean;
    createdAt: string;
    _count: {
        redemptions: number;
    };
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form
    const [form, setForm] = useState({
        code: '',
        amount: '',
        maxUses: '1'
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) {
                setCoupons(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setForm({ code: '', amount: '', maxUses: '1' });
                fetchCoupons();
            } else {
                alert('Error al crear cupón');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Borrar cupón?')) return;

        await fetch('/api/admin/coupons', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchCoupons();
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        // Could show toast here
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-indigo-600" />
                Gestión de Cupones
            </h2>

            {/* Create Form */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-sm">
                <h3 className="font-semibold mb-4 text-slate-100">Crear Nuevo Cupón</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Código</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            placeholder="EJ: PROMO10"
                            className="w-full px-3 py-2 border rounded-lg uppercase font-mono"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Importe (€)</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="10.00"
                            step="0.01"
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Usos Máximos</label>
                        <input
                            type="number"
                            value={form.maxUses}
                            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            min="1"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {isCreating ? 'Creando...' : <><Plus className="w-4 h-4" /> Crear Cupón</>}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">Usos</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Cargando...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay cupones creados.</td></tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-slate-900">
                                    <td className="px-6 py-4 font-mono font-medium text-white flex items-center gap-2">
                                        {coupon.code}
                                        <button onClick={() => copyCode(coupon.code)} className="text-slate-500 hover:text-indigo-500">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-green-400 font-bold">
                                        {formatCurrency(coupon.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.usedCount} / {coupon.maxUses}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.active && coupon.usedCount < coupon.maxUses
                                            ? <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded text-xs font-medium">Activo</span>
                                            : <span className="text-red-500 bg-red-500/20 px-2 py-1 rounded text-xs font-medium">Agotado</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-400 hover:text-red-400 p-1 rounded hover:bg-red-500/200/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

