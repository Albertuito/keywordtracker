'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Save, RotateCcw } from 'lucide-react';
import { PRICING } from '@/lib/pricing';

type PricingKey = keyof typeof PRICING;

const PRICING_LABELS: Record<PricingKey, { label: string; description: string }> = {
    keyword_check_daily: {
        label: 'Check Diario (Auto)',
        description: 'Verificación automática diaria (mejor precio)'
    },
    keyword_check_standard: {
        label: 'Check Standard (Cola)',
        description: 'Verificación de posición en cola (~5min)'
    },
    keyword_check_live: {
        label: 'Check Live (Instantáneo)',
        description: 'Verificación de posición en tiempo real'
    },
    ai_overview_check: {
        label: 'AI Overview Check',
        description: 'Verificar presencia en AI Overview'
    },
    search_volume: {
        label: 'Volumen de Búsqueda',
        description: 'Obtener volumen mensual de keyword'
    },
    competitor_analysis: {
        label: 'Análisis de Competencia',
        description: 'Análisis de dominio competidor'
    },
    keyword_research: {
        label: 'Keyword Research Report',
        description: 'Informe completo de investigación'
    },
    onpage_audit: {
        label: 'Auditoría On-Page (AI)',
        description: 'Análisis profundo con IA'
    },
    related_keywords: {
        label: 'Keywords Relacionadas',
        description: 'Búsqueda de keywords relacionadas con IA'
    }
};

export default function PricingPage() {
    const [pricing, setPricing] = useState<Record<string, number>>(PRICING);
    const [source, setSource] = useState<'default' | 'database'>('default');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const res = await fetch('/api/admin/pricing');
            const data = await res.json();
            if (data.pricing) {
                setPricing(data.pricing);
                setSource(data.source);
            }
        } catch (error) {
            console.error('Error fetching pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pricing })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Precios actualizados correctamente' });
                setSource('database');
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al guardar' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setPricing({ ...PRICING });
        setMessage({ type: 'success', text: 'Restaurado a valores por defecto (no guardado)' });
    };

    const handleChange = (key: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPricing(prev => ({ ...prev, [key]: numValue }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Editor de Precios</h2>
                        <p className="text-sm text-slate-400">
                            Fuente: {source === 'database' ? '📁 Base de datos' : '📄 Por defecto (código)'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-slate-200 bg-slate-800 border border-slate-500 rounded-lg hover:bg-slate-900 flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            {/* Pricing Grid */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-600">
                    {(Object.keys(PRICING_LABELS) as PricingKey[]).map((key) => (
                        <div key={key} className="p-6 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-white">{PRICING_LABELS[key].label}</h3>
                                <p className="text-sm text-slate-400">{PRICING_LABELS[key].description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">€</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={pricing[key] ?? 0}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className="w-24 px-3 py-2 bg-slate-900 text-white border border-slate-500 rounded-lg text-right font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-500/20 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-1">⚠️ Importante</h4>
                <p className="text-sm text-amber-400">
                    Los cambios de precio se aplican inmediatamente a nuevas transacciones.
                    Las transacciones existentes no se ven afectadas.
                </p>
            </div>
        </div>
    );
}

