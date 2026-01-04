'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useMemo } from 'react';

// Simple animated chart for the demo
function DemoChart() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Simulated 30-day ascending evolution
    const data = [45, 42, 38, 35, 32, 28, 25, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3];
    const max = 50;
    const width = 100;
    const height = 60;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((max - val) / max) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="relative h-32 w-full">
            <svg viewBox={`0 0 ${width} ${height + 10}`} className={`w-full h-full transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon
                    points={`0,${height} ${points} ${width},${height}`}
                    fill="url(#chartGradient)"
                />
                <polyline
                    points={points}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="absolute bottom-2 left-2 text-xs text-slate-500">30 días</div>
            <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-green-400 font-semibold">
                <span>▲ +42 posiciones</span>
            </div>
        </div>
    );
}

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
        <section ref={containerRef} className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-slate-800">

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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-200 text-green-400 text-sm font-semibold mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-green-500/200 animate-pulse"></span>
                    🎁 1€ GRATIS para nuevos usuarios
                </div>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
                    Monitoriza tus Rankings en Google
                    <span className="text-blue-500"> Sin Cuotas Mensuales</span>
                </h1>

                <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-6 leading-relaxed">
                    <strong className="text-white">Paga solo por lo que uses.</strong> Sin suscripciones, sin compromisos.
                    Consulta rankings cuando tú quieras, con datos 100% reales de Google.
                </p>

                {/* Price highlight - GRADIENT BACKGROUND */}
                <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-10">
                    <span className="text-5xl font-extrabold text-white">€0.03</span>
                    <div className="text-left">
                        <div className="text-lg font-bold text-white">por keyword</div>
                        <div className="text-sm text-blue-100">Sin mínimos ni máximos</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-blue-500/200 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                        >
                            Ir al Dashboard
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-blue-500/200 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                        >
                            Probar Gratis con 1€
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    )}
                    <Link
                        href="#how-it-works"
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-lg font-semibold text-lg border border-slate-600 transition-all flex items-center gap-2"
                    >
                        ¿Cómo funciona?
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-300 mb-16">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Sin cuotas mensuales</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Paga solo cuando consultas</strong></span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>1€ gratis al registrarte</strong></span>
                    </div>
                </div>

                {/* Dashboard Preview with REAL CHART */}
                <div className="relative mx-auto max-w-5xl rounded-xl border border-slate-600 bg-slate-800 shadow-2xl overflow-hidden">
                    <div className="bg-slate-700 px-4 py-3 border-b border-slate-600 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="inline-block px-4 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-600">
                                app.keywordtracker.es/dashboard
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-900">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 mb-1">Keywords</div>
                                <div className="text-2xl font-bold text-white">247</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 mb-1">En Top 10</div>
                                <div className="text-2xl font-bold text-green-500">89</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                <div className="text-xs text-slate-400 mb-1">Invertido este mes</div>
                                <div className="text-2xl font-bold text-blue-500">€4.94</div>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
                            <div className="text-sm font-medium text-slate-200 mb-2">Evolución de Rankings</div>
                            <DemoChart />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

