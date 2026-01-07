import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-slate-700 bg-slate-900 mt-auto py-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                {/* Brand */}
                <div className="space-y-4">
                    <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        KeywordTracker
                    </span>
                    <p className="text-slate-400 max-w-xs">
                        La herramienta de monitorización de rankings SEO más transparente y eficaz.
                    </p>
                    <div className="flex space-x-4">
                        <a href="https://x.com/Keywordtracker_" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <span className="sr-only">X (Twitter)</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-8 md:gap-16">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white">Producto</h3>
                        <div className="flex flex-col space-y-2 text-slate-400">
                            <Link href="/como-funciona" className="hover:text-blue-400 transition-colors">Cómo funciona</Link>
                            <Link href="/pricing" className="hover:text-blue-400 transition-colors">Precios</Link>
                            <Link href="/login" className="hover:text-blue-400 transition-colors">Iniciar Sesión</Link>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white">Legal</h3>
                        <div className="flex flex-col space-y-2 text-slate-400">
                            <Link href="/legal/aviso-legal" className="hover:text-blue-400 transition-colors">Aviso Legal</Link>
                            <Link href="/legal/politica-privacidad" className="hover:text-blue-400 transition-colors">Política de Privacidad</Link>
                            <Link href="/legal/politica-cookies" className="hover:text-blue-400 transition-colors">Política de Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
                © {new Date().getFullYear()} KeywordTracker. Todos los derechos reservados.
            </div>
        </footer>
    )
}

