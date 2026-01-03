export default function Features() {
    const features = [
        {
            icon: "📊",
            title: "Rankings en Tiempo Real",
            description: "Datos <strong>100% frescos</strong> directamente de Google. Sin caché, sin estimaciones."
        },
        {
            icon: "📈",
            title: "Historial Completo",
            description: "Visualiza la <strong>evolución de tus keywords</strong> con gráficos detallados."
        },
        {
            icon: "🎯",
            title: "Tracking de Competidores",
            description: "Monitoriza las <strong>posiciones de tu competencia</strong> en las mismas keywords."
        },
        {
            icon: "⚡",
            title: "Actualizaciones Automáticas",
            description: "Rankings <strong>actualizados automáticamente</strong> cada día sin que hagas nada."
        },
        {
            icon: "📱",
            title: "Multi-dispositivo",
            description: "Accede desde <strong>cualquier dispositivo</strong>. Responsive y optimizado."
        },
        {
            icon: "💰",
            title: "Paga por Uso",
            description: "<strong>Sin suscripciones</strong>. Paga solo por las consultas que realizas."
        }
    ];

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Todo lo que necesitas para dominar los rankings
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        <strong>Herramientas profesionales</strong> a precio accesible para monitorizar tu SEO.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-center"
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p
                                className="text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: feature.description }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
