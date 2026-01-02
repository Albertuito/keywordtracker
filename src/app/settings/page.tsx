'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        taxId: '',
        address: '',
        city: '',
        zip: '',
        country: ''
    });

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/user/settings')
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData({
                            name: data.name || '',
                            email: data.email || '',
                            companyName: data.companyName || '',
                            taxId: data.taxId || '',
                            address: data.address || '',
                            city: data.city || '',
                            zip: data.zip || '',
                            country: data.country || ''
                        });
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ text: 'Configuración actualizada correctamente', type: 'success' });
            } else {
                setMessage({ text: 'Error al actualizar la configuración', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Ocurrió un error inesperado', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!session) {
        return <div className="p-10 text-center text-slate-400">Por favor, inicia sesión para ver la configuración.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Configuración de Cuenta</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-200' : 'bg-red-900/50 border-red-500/50 text-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field w-full"
                                placeholder="Tu Nombre"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="input-field w-full opacity-50 cursor-not-allowed"
                                title="El email no se puede cambiar"
                            />
                        </div>
                    </div>
                </div>

                {/* Invoicing Data */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Datos de Facturación
                        </h2>
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold border border-slate-700 px-2 py-1 rounded">Requerido para Facturas</span>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Razón Social / Nombre Completo</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="ACME Corp S.L."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">NIF / CIF</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="B12345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">País</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="España"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Dirección de Facturación</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Calle Gran Vía 1, 3A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Ciudad</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="Madrid"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Código Postal</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                    placeholder="28013"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-8 py-3 text-base shadow-xl shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
