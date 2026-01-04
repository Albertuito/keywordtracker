export default function Logos() {
    return (
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white border-y border-blue-500/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        🎁 Empieza con <span className="text-green-400">1€ GRATIS</span>
                    </h3>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Al registrarte, recibes <strong className="text-white">1€ de saldo gratis</strong> para probar la herramienta sin compromiso.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-600 shadow-sm">
                        <div className="text-4xl font-bold text-blue-400 mb-2">~33</div>
                        <div className="text-slate-300">Keywords a <strong>€0.03</strong> cada una</div>
                        <div className="text-sm text-slate-500 mt-1">Con tu saldo gratuito</div>
                    </div>
                    <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-600 shadow-sm">
                        <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                        <div className="text-slate-300">Datos <strong>reales</strong> de Google</div>
                        <div className="text-sm text-slate-500 mt-1">Sin estimaciones ni caché</div>
                    </div>
                    <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-600 shadow-sm">
                        <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
                        <div className="text-slate-300"><strong>Sin límites</strong> de proyectos</div>
                        <div className="text-sm text-slate-500 mt-1">Crea todos los que necesites</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

