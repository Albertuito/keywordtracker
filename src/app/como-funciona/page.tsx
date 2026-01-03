'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import { PRICING } from "@/lib/pricing";

export default function ComoFuncionaPage() {
    const { data: session } = useSession();

    const steps = [
        {
            number: "01",
            title: "Crea tu proyecto",
            description: "Añade tu dominio y configura el país de posicionamiento. En segundos tendrás tu proyecto listo para empezar a monitorizar.",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            number: "02",
            title: "Añade tus keywords",
            description: "Introduce las palabras clave que quieres monitorizar. Puedes añadirlas una a una o importar un listado completo.",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            number: "03",
            title: "Consulta posiciones",
            description: "Solicita actualizaciones de ranking cuando lo necesites. Solo pagas por las consultas que realices, sin suscripciones mensuales.",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
        {
            number: "04",
            title: "Analiza y mejora",
            description: "Visualiza el histórico de posiciones, identifica tendencias y descubre oportunidades para mejorar tu SEO.",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        }
    ];

    const features = [
        {
            title: "Pago por uso",
            description: "Sin suscripciones. Recarga tu saldo cuando lo necesites y solo paga por las consultas que realices.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Datos en tiempo real",
            description: "Obtenemos los rankings directamente de Google para darte posiciones 100% precisas y actualizadas.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            title: "Histórico completo",
            description: "Guarda todo el historial de posiciones para analizar tendencias y medir el impacto de tus acciones SEO.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Análisis de competencia",
            description: "Descubre qué URLs de tus competidores están posicionando por las mismas keywords.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "Múltiples países",
            description: "Monitoriza rankings en España, México, Argentina, Estados Unidos y muchos más países.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Auto-tracking programado",
            description: "Configura actualizaciones automáticas diarias, cada 2 días o semanales para tus keywords más importantes.",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )
        }
    ];

    // Pricing data from real pricing.ts
    const pricingActions = [
        {
            name: "Ranking Standard",
            price: PRICING.keyword_check_standard,
            description: "Consulta en cola (2-5 min)",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            highlight: true
        },
        {
            name: "Ranking Live",
            price: PRICING.keyword_check_live,
            description: "Resultado instantáneo",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            name: "Volumen de búsqueda",
            price: PRICING.search_volume,
            description: "Datos mensuales de búsqueda",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            name: "Keywords relacionadas + IA",
            price: PRICING.related_keywords,
            description: "Análisis con inteligencia artificial",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mb-6">
                            Sin suscripciones • Pago por uso
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Monitoriza tus keywords de forma
                            <span className="text-blue-500"> simple y económica</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            KeywordTracker te permite conocer la posición exacta de tu web en Google.
                            Solo pagas por las consultas que realizas, sin costes fijos ni compromisos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Ir al Dashboard
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        Empezar gratis
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200"
                                    >
                                        Iniciar sesión
                                    </Link>
                                </>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            🎁 1€ de crédito gratis para nuevos usuarios
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Cómo funciona
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            En 4 sencillos pasos tendrás control total sobre tus posiciones en Google
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-8"></div>
                                )}
                                <div className="bg-gray-50 rounded-2xl p-8 h-full hover:shadow-lg transition-shadow">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                                        {step.icon}
                                    </div>
                                    <span className="text-sm font-bold text-blue-500 mb-2 block">{step.number}</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Todo lo que necesitas
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Herramientas profesionales de SEO sin la complejidad ni el precio de las grandes plataformas
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing - Updated with real prices */}
            <section className="py-20 bg-white" id="precios">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Precios transparentes
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Sin suscripciones ni costes ocultos. Recarga tu saldo y paga solo por lo que uses.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {/* Price cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {pricingActions.map((action, index) => (
                                <div
                                    key={index}
                                    className={`rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${action.highlight
                                            ? 'border-blue-500 bg-blue-50/50'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.highlight ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {action.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{action.name}</h3>
                                                <p className="text-sm text-gray-500">{action.description}</p>
                                            </div>
                                        </div>
                                        {action.highlight && (
                                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {action.price.toFixed(2).replace('.', ',')}€
                                        </span>
                                        <span className="text-gray-500">/ consulta</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Value proposition box */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                💡 ¿Cuánto puedes hacer con 1€?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <p className="text-4xl font-bold mb-1">50</p>
                                    <p className="text-blue-100 text-sm">Consultas de ranking Standard</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <p className="text-4xl font-bold mb-1">20</p>
                                    <p className="text-blue-100 text-sm">Consultas Live instantáneas</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <p className="text-4xl font-bold mb-1">33</p>
                                    <p className="text-blue-100 text-sm">Consultas de volumen</p>
                                </div>
                            </div>
                            <p className="text-blue-100 mb-6">
                                Los nuevos usuarios reciben <strong className="text-white">1€ gratis</strong> para probar todas las funcionalidades
                            </p>
                            {!session && (
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-all shadow-lg"
                                >
                                    Crear cuenta gratis
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            )}
                        </div>

                        {/* Additional pricing info */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sin caducidad
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Tu saldo nunca caduca. Recarga cuando quieras y úsalo a tu ritmo, sin presiones ni fechas límite.
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sin límites
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Crea todos los proyectos y keywords que necesites. Solo pagas cuando consultas las posiciones.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Preguntas frecuentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿Qué diferencia hay entre Standard y Live?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                <strong>Standard (0,02€)</strong> procesa tu consulta en cola, con un tiempo de espera de 2-5 minutos. Ideal para actualizar muchas keywords.
                                <br /><br />
                                <strong>Live (0,05€)</strong> te da el resultado al instante. Perfecto cuando necesitas saber la posición en ese momento.
                            </p>
                        </details>

                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿De dónde se obtienen los rankings?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Utilizamos DataForSEO, uno de los proveedores de datos SEO más precisos del mercado. Los rankings se consultan directamente a Google para garantizar la máxima precisión.
                            </p>
                        </details>

                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿Puedo monitorizar cualquier país?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Sí, soportamos rankings en España, México, Argentina, Colombia, Chile, Perú, Estados Unidos, Reino Unido, Francia, Alemania, Italia, Portugal y Brasil.
                            </p>
                        </details>

                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿Qué incluye el análisis de keywords relacionadas?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Por 0,15€ obtienes keywords relacionadas con volumen de búsqueda, dificultad SEO, CPC y un análisis con inteligencia artificial (GPT-4) que te recomienda qué keywords atacar y cómo optimizar tus páginas existentes.
                            </p>
                        </details>

                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿Hay límite de keywords o proyectos?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Puedes crear tantos proyectos y keywords como necesites. Solo pagas cuando actualizas las posiciones.
                            </p>
                        </details>

                        <details className="bg-white rounded-xl p-6 border border-gray-100 group">
                            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900">
                                ¿Cómo funciona el auto-tracking?
                                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Puedes configurar cada keyword para que se actualice automáticamente cada día, cada 2 días o cada semana. El coste por consulta automática es el mismo que el Standard (0,02€).
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-blue-500 to-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        ¿Listo para empezar?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Crea tu cuenta gratis y recibe 1€ de crédito para probar la plataforma
                    </p>
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-all shadow-lg"
                        >
                            Ir al Dashboard
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-all shadow-lg"
                        >
                            Crear cuenta gratis
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
