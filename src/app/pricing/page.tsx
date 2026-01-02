'use client';

import { useSession } from "next-auth/react";

export default function PricingPage() {
    const { data: session } = useSession();

    const plans = [
        {
            name: "Gratis",
            price: "€0",
            period: "/mes",
            description: "Perfecto para empezar y rastrear proyectos personales.",
            features: [
                "Rastrear hasta 10 Keywords",
                "1 Proyecto",
                "Rankings Diarios (Manual)",
                "Soporte Básico"
            ],
            cta: "Plan Actual",
            active: true
        },
        {
            name: "Pro",
            price: "€29",
            period: "/mes",
            description: "Para profesionales y agencias en crecimiento.",
            features: [
                "Rastrear hasta 500 Keywords",
                "10 Proyectos",
                "Rankings Diarios (Automáticos)",
                "Soporte Prioritario",
                "Análisis de Competencia",
                "Reportes Marca Blanca"
            ],
            cta: "Mejorar a Pro",
            highlight: true
        },
        {
            name: "Agencia",
            price: "€99",
            period: "/mes",
            description: "Máxima potencia para grandes operaciones.",
            features: [
                "Rastrear hasta 2,500 Keywords",
                "Proyectos Ilimitados",
                "Actualizaciones por Hora (Bajo Demanda)",
                "Gestor de Cuenta Dedicado",
                "Acceso a API",
                "Facturación Personalizada"
            ],
            cta: "Contactar Ventas"
        }
    ];

    return (
        <div className="bg-slate-950 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-emerald-400 uppercase tracking-wide">Precios</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Planes para equipos de todos los tamaños
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-400">
                    Elige el plan perfecto para tus necesidades SEO. Actualiza o cancela en cualquier momento.
                </p>

                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-3xl p-8 ring-1 xl:p-10 ${plan.highlight
                                ? 'bg-slate-900/50 ring-emerald-500 shadow-2xl shadow-emerald-900/20 relative overflow-hidden'
                                : 'bg-slate-900/20 ring-white/10 hover:bg-slate-900/40 transition-colors'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 overflow-hidden">
                                    <div className="absolute top-0 right-0 transform rotate-45 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold py-1 px-10 shadow-lg">
                                        POPULAR
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-x-4">
                                <h3 id={plan.name} className="text-lg font-semibold leading-8 text-white">
                                    {plan.name}
                                </h3>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-400">
                                {plan.description}
                            </p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                                <span className="text-sm font-semibold leading-6 text-slate-400">{plan.period}</span>
                            </p>
                            <a
                                href="#"
                                aria-describedby={plan.name}
                                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${plan.highlight
                                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-emerald-600 shadow-lg shadow-emerald-900/20'
                                    : plan.active
                                        ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                                        : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
                                    }`}
                            >
                                {plan.cta}
                            </a>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-400 xl:mt-10">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <svg className={`h-6 w-5 flex-none ${plan.highlight ? 'text-emerald-400' : 'text-slate-500'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
