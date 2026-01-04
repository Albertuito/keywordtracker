import { CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
    return (
        <section className="py-24 bg-slate-950 border-y border-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Quiénes Somos: <br />
                            <span className="text-emerald-400">SEOs que construyen para SEOs</span>
                        </h2>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                            Estábamos cansados de herramientas caras, lentas y llenas de funcionalidades que nadie usa. Queríamos datos, velocidad y precisión.
                        </p>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Nuestro equipo ha gestionado campañas para empresas del Fortune 500 y startups de alto crecimiento. Sabemos que un dato incorrecto puede costar miles de euros. Por eso, hemos construido el rank tracker más fiable del mercado.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Datos obtenidos directamente de Google, sin intermediarios 'low cost'.",
                                "Infraestructura escalable capaz de trackear millones de keywords.",
                                "Soporte técnico por verdaderos especialistas SEO.",
                                "Actualizaciones constantes basadas en feedback real."
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <span className="text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-3xl" />
                        <div className="relative p-8 rounded-3xl bg-slate-900 border border-slate-800">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                                    <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-widest">Uptime</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                                    <div className="text-4xl font-bold text-emerald-400 mb-2">10M+</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-widest">Keywords</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center col-span-2">
                                    <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-widest">Monitorización</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

