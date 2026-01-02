'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email'); // Just for display
    const token = searchParams.get('token'); // If user clicks link from email
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

    // Auto-verify if token is present
    if (token && status === 'idle') {
        setStatus('verifying');
        fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setTimeout(() => router.push('/api/auth/signin'), 3000);
                } else {
                    setStatus('error');
                }
            })
            .catch(() => setStatus('error'));
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl border border-slate-800 text-center">

                    {/* Status Icons */}
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-800 mb-4">
                        {status === 'success' ? (
                            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : status === 'error' ? (
                            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {status === 'success' ? '¡Email Verificado!' :
                            status === 'error' ? 'Error de Verificación' :
                                'Verifica tu Email'}
                    </h2>

                    {status === 'idle' && (
                        <>
                            <p className="text-slate-400 mb-6">
                                Hemos enviado un enlace de confirmación a:
                                <br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                            <div className="text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-300">
                                💡 Tip de desarrollo: Mira la consola del servidor para ver el enlace de verificación simulado.
                            </div>
                        </>
                    )}

                    {status === 'verifying' && (
                        <p className="text-slate-400">Verificando token...</p>
                    )}

                    {status === 'success' && (
                        <p className="text-slate-400">Todo listo. Redirigiendo al login...</p>
                        // Or Button if redirect fails
                    )}

                    {status === 'error' && (
                        <p className="text-red-400">El enlace ha expirado o no es válido.</p>
                    )}

                    <div className="mt-6">
                        <Link href="/" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
