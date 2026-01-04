'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, UserPlus, Gift, CreditCard } from 'lucide-react';

interface AppSettings {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    welcomeCredit: number;
    minRechargeAmount: number;
    maxRechargeAmount: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setSettings(data.settings);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof AppSettings, value: any) => {
        setSaving(key);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                setSettings(prev => prev ? { ...prev, [key]: value } : null);
                setMessage({ type: 'success', text: `Ajuste "${key}" actualizado` });
            } else {
                setMessage({ type: 'error', text: 'Error al guardar' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(null);
        }
    };

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                    <Settings className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Ajustes del Sistema</h2>
                    <p className="text-sm text-slate-400">Configuración global de la aplicación</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-200' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            {/* Settings Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Maintenance Mode */}
                <div className={`bg-slate-800 border rounded-xl p-6 ${settings.maintenanceMode ? 'border-red-300 bg-red-500/20' : 'border-slate-600'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-100' : 'bg-slate-700'}`}>
                                <AlertTriangle className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Modo Mantenimiento</h3>
                                <p className="text-sm text-slate-400">Bloquea el acceso a usuarios</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                            disabled={saving === 'maintenanceMode'}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500/200' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-slate-800 transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Registration */}
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Registro Habilitado</h3>
                                <p className="text-sm text-slate-400">Permitir nuevos usuarios</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('registrationEnabled', !settings.registrationEnabled)}
                            disabled={saving === 'registrationEnabled'}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.registrationEnabled ? 'bg-green-500/200' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-slate-800 transition-transform ${settings.registrationEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Welcome Credit */}
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Gift className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Crédito de Bienvenida</h3>
                            <p className="text-sm text-slate-400">Saldo gratis para nuevos usuarios</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400">€</span>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="50"
                            value={settings.welcomeCredit}
                            onChange={(e) => setSettings({ ...settings, welcomeCredit: parseFloat(e.target.value) || 0 })}
                            className="flex-1 px-3 py-2 border border-slate-500 rounded-lg font-mono"
                        />
                        <button
                            onClick={() => updateSetting('welcomeCredit', settings.welcomeCredit)}
                            disabled={saving === 'welcomeCredit'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Recharge Limits */}
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Límites de Recarga</h3>
                            <p className="text-sm text-slate-400">Min/Max para recargas Stripe</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Mínimo (€)</label>
                            <input
                                type="number"
                                min="1"
                                value={settings.minRechargeAmount}
                                onChange={(e) => setSettings({ ...settings, minRechargeAmount: parseInt(e.target.value) || 5 })}
                                className="w-full px-3 py-2 border border-slate-500 rounded-lg font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Máximo (€)</label>
                            <input
                                type="number"
                                min="10"
                                value={settings.maxRechargeAmount}
                                onChange={(e) => setSettings({ ...settings, maxRechargeAmount: parseInt(e.target.value) || 200 })}
                                className="w-full px-3 py-2 border border-slate-500 rounded-lg font-mono"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            updateSetting('minRechargeAmount', settings.minRechargeAmount);
                            updateSetting('maxRechargeAmount', settings.maxRechargeAmount);
                        }}
                        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Guardar Límites
                    </button>
                </div>
            </div>
        </div>
    );
}

