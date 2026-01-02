import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-20 bg-blue-500">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    ¿Listo para dominar los rankings?
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                    Empieza gratis hoy. Sin tarjeta de crédito. Sin compromisos.
                </p>
                <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 rounded-lg font-semibold text-lg transition-all shadow-lg"
                >
                    Crear cuenta gratis
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
