'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CheckCircle2, ShieldCheck, Mail, Lock, User, Building2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            // Auto login after register
            await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-zinc-200">

            {/* Left Side - Trust & Info */}
            <div className="hidden md:flex flex-col justify-center w-5/12 p-12 bg-zinc-900 border-r border-zinc-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-white text-lg">R</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">RankTracker</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Empieza a monitorizar como los <span className="text-indigo-400">profesionales</span>.
                    </h1>

                    <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                        Únete a más de 2000 especialistas SEO que confían en nuestros datos. Sin tarjeta de crédito requerida para empezar.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-indigo-500/200/10 text-indigo-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Datos 100% Precisos</h3>
                                <p className="text-sm text-zinc-500">Verificamos directamente en Google, sin intermediarios de baja calidad.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-indigo-500/200/10 text-indigo-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Privacidad Total</h3>
                                <p className="text-sm text-zinc-500">Tus datos y los de tus clientes están encriptados y seguros.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900"></div>
                                <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-zinc-900"></div>
                                <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-zinc-900"></div>
                            </div>
                            <span className="text-sm text-zinc-400 font-medium ml-2">+2k usuarios activos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950">
                <div className="max-w-[480px] w-full">

                    <div className="md:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <span className="font-bold text-white text-lg">R</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">RankTracker</span>
                        </Link>
                    </div>

                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
                        <p className="text-zinc-400 mb-8 text-sm">Introduce tus datos para acceder al panel.</p>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/200/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre Completo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-10"
                                        placeholder="Ej: Alberto García"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Profesional</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-10"
                                        placeholder="nombre@empresa.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Empresa (Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="Tu Agencia S.L."
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input-field pl-10"
                                            placeholder="••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirmar</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input-field pl-10"
                                            placeholder="••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base mt-2 shadow-lg shadow-indigo-600/20"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Creando cuenta...
                                    </span>
                                ) : (
                                    'Crear Cuenta Gratuita'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-500">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/api/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

