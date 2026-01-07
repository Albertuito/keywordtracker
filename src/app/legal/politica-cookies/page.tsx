import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Cookies | KeywordTracker',
    description: 'Información sobre el uso de cookies en KeywordTracker.',
};

export default function PoliticaCookiesPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Política de Cookies</h1>

            <section className="space-y-6">
                <p>
                    Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de usuario y analizar el tráfico.
                </p>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">¿Qué son las cookies?</h2>
                    <p>
                        Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Tipos de cookies que utilizamos</h2>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>
                            <strong>Cookies Técnicas (Necesarias):</strong> Permiten el funcionamiento básico de la web, como el inicio de sesión o el proceso de compra. No requieren consentimiento.
                        </li>
                        <li>
                            <strong>Cookies de Análisis (Google Analytics 4):</strong> Nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Gestión de cookies</h2>
                    <p>
                        Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" className="text-blue-400 hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" className="text-blue-400 hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" className="text-blue-400 hover:underline">Safari</a></li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
