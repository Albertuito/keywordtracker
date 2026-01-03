export default function HowItWorks() {
    const steps = [
        {
            number: "1",
            title: "Crea tu proyecto",
            description: "Añade tu dominio, elige el país y el idioma. Configura el tracking automático (diario, semanal, o manual)."
        },
        {
            number: "2",
            title: "Añade keywords",
            description: "Introduce las palabras clave que te importan. Sin límite de keywords por proyecto."
        },
        {
            number: "3",
            title: "Monitoriza y analiza",
            description: "Obtén posiciones en tiempo real, historial de evolución, análisis de competencia e informes detallados."
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Cómo funciona
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        <strong>Tres simples pasos</strong> para empezar a monitorizar y <strong>mejorar tu posicionamiento</strong> en Google.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {steps.map((step, i) => (
                        <div key={i} className="text-center bg-gray-50 rounded-xl p-8 border border-gray-100">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Connector line on desktop */}
                <div className="hidden md:flex justify-center mt-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="w-20 h-px bg-gradient-to-r from-transparent to-blue-300"></span>
                        <span className="text-blue-500 font-medium">Todo en menos de 5 minutos</span>
                        <span className="w-20 h-px bg-gradient-to-l from-transparent to-blue-300"></span>
                    </div>
                </div>
            </div>
        </section>
    );
}
