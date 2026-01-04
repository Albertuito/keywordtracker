import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    ¿Listo para dominar los rankings?
                </h2>
                <p className="text-lg text-blue-100 mb-4 max-w-xl mx-auto">
                    Empieza gratis hoy. Sin tarjeta de crédito. Sin compromisos.
                </p>
                <p className="text-xl font-semibold text-white mb-8">
                    🎁 <span className="underline decoration-green-400 decoration-2">1€ de saldo gratis</span> al registrarte
                </p>
                <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-900 text-blue-400 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
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

