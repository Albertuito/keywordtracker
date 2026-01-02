export default function HowItWorks() {
    const steps = [
        {
            number: "1",
            title: "Crea tu proyecto",
            description: "Añade tu dominio y empieza a configurar tu tracking."
        },
        {
            number: "2",
            title: "Añade keywords",
            description: "Introduce las palabras clave que quieres monitorizar."
        },
        {
            number: "3",
            title: "Monitoriza",
            description: "Revisa tus rankings actualizados cada día automáticamente."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Cómo funciona
                    </h2>
                    <p className="text-lg text-gray-600">
                        Tres simples pasos para empezar a monitorizar tus rankings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {steps.map((step, i) => (
                        <div key={i} className="text-center">
                            <div className="w-14 h-14 rounded-full bg-blue-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
