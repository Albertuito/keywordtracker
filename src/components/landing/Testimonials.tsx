export default function Testimonials() {
    const testimonials = [
        {
            name: "Carlos M.",
            role: "Agencia SEO",
            content: "Por fin un tracker que no cuesta una fortuna y da datos reales. Exactamente lo que necesitaba.",
            avatar: "C"
        },
        {
            name: "Laura P.",
            role: "Freelancer SEO",
            content: "Simple, rápido y preciso. La interfaz es muy clara y fácil de usar.",
            avatar: "L"
        },
        {
            name: "Miguel R.",
            role: "E-commerce",
            content: "El modelo de pago por uso es perfecto para proyectos pequeños. Gran herramienta.",
            avatar: "M"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Lo que dicen nuestros usuarios
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                            <p className="text-gray-600 mb-6">"{t.content}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{t.name}</div>
                                    <div className="text-sm text-gray-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
