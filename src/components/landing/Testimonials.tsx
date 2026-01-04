export default function Testimonials() {
    const testimonials = [
        {
            name: "Carlos M.",
            role: "Webmaster",
            content: "Por fin un tracker que no cuesta una fortuna y da datos reales de Google. Puedo monitorizar todos mis sitios sin arruinarme.",
            avatar: "C",
            color: "bg-blue-500"
        },
        {
            name: "Laura P.",
            role: "Agencia SEO",
            content: "Mis clientes están encantados con los informes. El modelo de pago por uso es perfecto para gestionar múltiples proyectos.",
            avatar: "L",
            color: "bg-purple-500"
        },
        {
            name: "Miguel R.",
            role: "Webmaster",
            content: "Simple, rápido y preciso. La interfaz es muy clara y el historial de evolución me ayuda a ver el progreso real.",
            avatar: "M",
            color: "bg-green-500"
        }
    ];

    return (
        <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Lo que dicen nuestros usuarios
                    </h2>
                    <p className="text-lg text-slate-300">
                        <strong>Webmasters y agencias</strong> que ya confían en KeywordTracker
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-600 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-slate-200 mb-6 italic leading-relaxed">"{t.content}"</p>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${t.color} text-white flex items-center justify-center font-bold`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{t.name}</div>
                                    <div className="text-sm text-slate-400">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

