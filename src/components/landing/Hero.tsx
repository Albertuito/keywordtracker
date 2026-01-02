'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useMemo } from 'react';

export default function Hero() {
    const { data: session } = useSession();
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const containerRef = useRef<HTMLDivElement>(null);

    const gridSize = 40;
    const cols = 50;
    const rows = 20;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };
        const handleMouseLeave = () => {
            setMousePos({ x: -1000, y: -1000 });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }
        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    const squares = useMemo(() => {
        const items = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                items.push({ row, col, x: col * gridSize, y: row * gridSize });
            }
        }
        return items;
    }, []);

    return (
        <section ref={containerRef} className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white">

            {/* Interactive Grid */}
            <div className="absolute inset-0 overflow-hidden">
                {squares.map((sq, i) => {
                    const centerX = sq.x + gridSize / 2;
                    const centerY = sq.y + gridSize / 2;
                    const distance = Math.sqrt(
                        Math.pow(mousePos.x - centerX, 2) +
                        Math.pow(mousePos.y - centerY, 2)
                    );
                    const maxDist = 100;
                    const isNear = distance < maxDist;
                    const scale = isNear ? 1 + (1 - distance / maxDist) * 0.3 : 1;
                    const opacity = isNear ? 0.05 + (1 - distance / maxDist) * 0.15 : 0;

                    return (
                        <div
                            key={i}
                            className="absolute transition-all duration-200 ease-out rounded-sm"
                            style={{
                                left: sq.x + 4,
                                top: sq.y + 4,
                                width: gridSize - 8,
                                height: gridSize - 8,
                                transform: `scale(${scale})`,
                                backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Static grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">

                {/* Badge - 1€ gratis */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    🎁 1€ GRATIS para nuevos usuarios
                </div>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
                    Monitoriza tus Rankings en Google
                    <span className="text-blue-500"> Sin Cuotas Mensuales</span>
                </h1>

                <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-6 leading-relaxed">
                    <strong className="text-gray-900">Paga solo por lo que uses.</strong> Sin suscripciones, sin compromisos.
                    Consulta rankings cuando tú quieras, con datos 100% reales de Google.
                </p>

                {/* Price highlight */}
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-50 border border-blue-100 mb-10">
                    <span className="text-4xl font-bold text-blue-600">€0.02</span>
                    <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">por keyword</div>
                        <div className="text-xs text-gray-500">Sin mínimos ni máximos</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                        >
                            Ir al Dashboard
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                        >
                            Probar Gratis con 1€
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    )}
                    <Link
                        href="#how-it-works"
                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-lg border border-gray-200 transition-all flex items-center gap-2"
                    >
                        ¿Cómo funciona?
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600 mb-16">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Sin cuotas mensuales</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Paga solo cuando consultas</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>1€ gratis al registrarte</strong></span>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="relative mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="inline-block px-4 py-1 bg-white rounded text-xs text-gray-500 border border-gray-200">
                                app.keywordtracker.es/dashboard
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Keywords</div>
                                <div className="text-2xl font-bold text-gray-900">247</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">En Top 10</div>
                                <div className="text-2xl font-bold text-green-500">89</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Invertido este mes</div>
                                <div className="text-2xl font-bold text-blue-500">€4.94</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 h-32 flex items-center justify-center text-gray-400 text-sm">
                            Gráfico de evolución de rankings
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
