export default function Features() {
    const features = [
        {
            icon: "📊",
            title: "Rankings en Tiempo Real",
            description: "Datos 100% frescos directamente de Google. Sin caché, sin estimaciones."
        },
        {
            icon: "📈",
            title: "Historial Completo",
            description: "Visualiza la evolución de tus keywords con gráficos detallados."
        },
        {
            icon: "🎯",
            title: "Tracking de Competidores",
            description: "Monitoriza las posiciones de tu competencia en las mismas keywords."
        },
        {
            icon: "⚡",
            title: "Actualizaciones Automáticas",
            description: "Rankings actualizados automáticamente cada día sin que hagas nada."
        },
        {
            icon: "📱",
            title: "Multi-dispositivo",
            description: "Accede desde cualquier dispositivo. Responsive y optimizado."
        },
        {
            icon: "💰",
            title: "Paga por Uso",
            description: "Sin suscripciones. Paga solo por las consultas que realizas."
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
                        Herramientas profesionales a precio accesible para monitorizar tu SEO.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
