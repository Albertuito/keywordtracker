'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="text-sm text-slate-300 md:flex-1">
                    <p>
                        Utilizamos cookies propias y de terceros para mejorar su experiencia y analizar el tráfico.
                        Al continuar navegando, acepta su uso de acuerdo con nuestra{' '}
                        <Link href="/legal/politica-cookies" className="text-blue-400 hover:text-blue-300 underline">
                            Política de Cookies
                        </Link>.
                    </p>
                </div>
                <div className="flex gap-3 whitespace-nowrap">
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-blue-500/20"
                    >
                        Aceptar Todo
                    </button>
                    <button
                        onClick={acceptCookies} // For MVP, simple accept/dismiss. Real compliance might need explicit rejection.
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors text-sm border border-slate-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
