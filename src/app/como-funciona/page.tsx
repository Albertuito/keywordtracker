import Link from 'next/link';
import Image from 'next/image';

export default function ComoFuncionaPage() {
    return (
        <div className="bg-slate-900 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900/0 to-slate-900/0"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Domina el SEO en <span className="text-blue-500">4 Pasos Sencillos</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        KeywordTracker simplifica el seguimiento de tus posiciones en Google. Sin curvas de aprendizaje complejas.
                    </p>
                </div>
            </section>

            {/* Steps Container */}
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-24">

                {/* Step 1: Create Project */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src="c:/Users/Alberto/.gemini/antigravity/brain/d2feeb63-c7d4-4ff5-881e-4ab1f4eccd2d/howitworks_create_project_1767789623066.png"
                                alt="Crear Proyecto"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl border border-blue-500/30">1</div>
                        <h2 className="text-3xl font-bold text-white">Crea tu Proyecto</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            El primer paso es definir qué dominio quieres monitorizar. Simplemente introduce la URL de tu web (ej. <code>tiendaonline.com</code>) y selecciona el idioma/país objetivo.
                        </p>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Soporte para Google local (ES, US, UK, etc.)
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Configuración en segundos
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Step 2: Add Keywords */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-bold text-xl border border-purple-500/30">2</div>
                        <h2 className="text-3xl font-bold text-white">Añade tus Palabras Clave</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Dinos por qué términos quieres que te encuentren tus clientes. Puedes añadirlas manualmente una a una o pegar una lista completa.
                        </p>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <p className="text-sm text-slate-400 mb-2">💡 <strong>Consejo Pro:</strong></p>
                            <p className="text-slate-300 text-sm">Usa términos específicos ("zapatillas running baratas") en lugar de genéricos ("zapatillas") para obtener resultados más rápidos.</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src="c:/Users/Alberto/.gemini/antigravity/brain/d2feeb63-c7d4-4ff5-881e-4ab1f4eccd2d/howitworks_add_keyword_1767789642836.png"
                                alt="Añadir Keyword"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Step 3: Analyze Dashboard */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src="c:/Users/Alberto/.gemini/antigravity/brain/d2feeb63-c7d4-4ff5-881e-4ab1f4eccd2d/howitworks_dashboard_1767789663959.png"
                                alt="Dashboard Análisis"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xl border border-emerald-500/30">3</div>
                        <h2 className="text-3xl font-bold text-white">Analiza tus Posiciones</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Accede a tu Dashboard para ver en tiempo real dónde apareces en Google. Los datos se actualizan automáticamente para que sepas si subes o bajas.
                        </p>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">TOP 1-3</span>
                                Tus mejores posiciones destacadas
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-400 font-bold">Tendencias</span>
                                Gráficos visuales de tu progreso
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold">Volumen</span>
                                Cuánta gente busca esa palabra al mes
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Step 4: Tracking & Reports */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-xl border border-amber-500/30">4</div>
                        <h2 className="text-3xl font-bold text-white">Autotracking y Seguridad</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Olvídate de revisar manualmente. Nuestro sistema realiza comprobaciones periódicas y te mantenemos en control de tu presupuesto. Pagas solo por lo que usas.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/register" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                                Empezar Ahora
                            </Link>
                            <Link href="/pricing" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-all">
                                Ver Precios
                            </Link>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                            <img
                                src="c:/Users/Alberto/.gemini/antigravity/brain/d2feeb63-c7d4-4ff5-881e-4ab1f4eccd2d/howitworks_report_1767789690321.png"
                                alt="Reportes Automatizados"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* FAQ Section */}
            <section className="bg-slate-800/50 py-20 mt-20 border-t border-slate-800">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Preguntas Frecuentes</h2>
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold text-lg text-white mb-2">¿Cómo funciona el sistema de créditos?</h3>
                            <p className="text-slate-400">
                                Es muy simple: 1 Keyword = 1 Crédito por actualización. Si monitorizas 10 palabras clave todos los días, consumirás 10 créditos diarios. Sin cuotas mensuales fijas obligatorias.
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold text-lg text-white mb-2">¿Puedo monitorizar a mi competencia?</h3>
                            <p className="text-slate-400">
                                ¡Sí! Puedes crear proyectos separados para tus competidores y ver exactamente por qué palabras clave están posicionando mejor que tú.
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold text-lg text-white mb-2">¿Son los datos fiables?</h3>
                            <p className="text-slate-400">
                                Usamos fuentes de datos de nivel empresarial que simulan búsquedas reales en Google desde la ubicación específica que elijas, garantizando una precisión del 99.9%.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
