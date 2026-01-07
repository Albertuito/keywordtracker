import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Política de Cookies | KeywordTracker',
    description: 'Información sobre el uso de cookies en KeywordTracker.es conforme a la normativa europea.',
};

export default function PoliticaCookiesPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Política de Cookies</h1>
            <p className="text-slate-400 mb-8">Última actualización: 7 de enero de 2026</p>

            <section className="space-y-8">

                {/* 1. Introducción */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">1. ¿Qué son las Cookies?</h2>
                    <p className="mb-4">
                        Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tablet, teléfono móvil) cuando los visita. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
                    </p>
                    <p>
                        Las cookies pueden ser "propias" (establecidas por el sitio web que está visitando) o "de terceros" (establecidas por otros sitios web). También pueden ser "de sesión" (se eliminan cuando cierra el navegador) o "persistentes" (permanecen en su dispositivo durante un período determinado o hasta que las elimine).
                    </p>
                </div>

                {/* 2. Uso de Cookies */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">2. ¿Qué Cookies Utilizamos?</h2>
                    <p className="mb-4">En <strong className="text-white">keywordtracker.es</strong> utilizamos los siguientes tipos de cookies:</p>

                    {/* Cookies Técnicas */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.1. Cookies Técnicas o Necesarias</h3>
                        <p className="mb-4 text-slate-400">
                            Son imprescindibles para el funcionamiento del sitio web. Permiten al usuario navegar y utilizar las funciones básicas del sitio. No requieren consentimiento.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-600">
                                        <th className="text-left py-2 text-white">Cookie</th>
                                        <th className="text-left py-2 text-white">Proveedor</th>
                                        <th className="text-left py-2 text-white">Finalidad</th>
                                        <th className="text-left py-2 text-white">Duración</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-400">
                                    <tr className="border-b border-slate-700">
                                        <td className="py-2">next-auth.session-token</td>
                                        <td className="py-2">KeywordTracker</td>
                                        <td className="py-2">Gestión de sesión de usuario</td>
                                        <td className="py-2">Sesión / 30 días</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-2">next-auth.csrf-token</td>
                                        <td className="py-2">KeywordTracker</td>
                                        <td className="py-2">Protección contra ataques CSRF</td>
                                        <td className="py-2">Sesión</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-2">next-auth.callback-url</td>
                                        <td className="py-2">KeywordTracker</td>
                                        <td className="py-2">Redirección tras inicio de sesión</td>
                                        <td className="py-2">Sesión</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">cookieConsent</td>
                                        <td className="py-2">KeywordTracker</td>
                                        <td className="py-2">Almacena preferencia de cookies</td>
                                        <td className="py-2">1 año</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cookies Analíticas */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.2. Cookies de Análisis o Medición</h3>
                        <p className="mb-4 text-slate-400">
                            Permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización del servicio. Requieren consentimiento previo.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-600">
                                        <th className="text-left py-2 text-white">Cookie</th>
                                        <th className="text-left py-2 text-white">Proveedor</th>
                                        <th className="text-left py-2 text-white">Finalidad</th>
                                        <th className="text-left py-2 text-white">Duración</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-400">
                                    <tr className="border-b border-slate-700">
                                        <td className="py-2">_ga</td>
                                        <td className="py-2">Google Analytics</td>
                                        <td className="py-2">Distinguir usuarios únicos</td>
                                        <td className="py-2">2 años</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-2">_ga_KMJQX5BLEB</td>
                                        <td className="py-2">Google Analytics 4</td>
                                        <td className="py-2">Mantener estado de sesión</td>
                                        <td className="py-2">2 años</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">_gid</td>
                                        <td className="py-2">Google Analytics</td>
                                        <td className="py-2">Distinguir usuarios</td>
                                        <td className="py-2">24 horas</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                            Para más información sobre las cookies de Google Analytics, visite: <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Política de Cookies de Google</a>
                        </p>
                    </div>

                    {/* Cookies de Terceros para Pagos */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.3. Cookies de Servicios de Pago</h3>
                        <p className="mb-4 text-slate-400">
                            Cuando utiliza nuestros servicios de pago, terceros como Stripe y PayPal pueden establecer cookies para procesar transacciones de forma segura. Estas cookies son necesarias para la funcionalidad de pago.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong className="text-white">Stripe:</strong> Cookies para prevención de fraude y procesamiento seguro de pagos.</li>
                            <li><strong className="text-white">PayPal:</strong> Cookies para autenticación y seguridad de transacciones.</li>
                        </ul>
                        <p className="mt-4 text-sm text-slate-500">
                            Para más información: <a href="https://stripe.com/es/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Política de Cookies de Stripe</a> | <a href="https://www.paypal.com/es/webapps/mpp/ua/cookie-full" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Política de Cookies de PayPal</a>
                        </p>
                    </div>
                </div>

                {/* 3. Base Legal */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">3. Base Legal para el Uso de Cookies</h2>
                    <p className="mb-4">
                        De conformidad con el artículo 22.2 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), y la normativa de protección de datos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Cookies técnicas:</strong> se utilizan en base a nuestro interés legítimo de proporcionar un servicio funcional. No requieren consentimiento.</li>
                        <li><strong className="text-white">Cookies analíticas y de terceros:</strong> se utilizan únicamente cuando el usuario ha dado su consentimiento previo mediante el banner de cookies mostrado en su primera visita.</li>
                    </ul>
                </div>

                {/* 4. Gestión de Cookies */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">4. ¿Cómo Gestionar las Cookies?</h2>
                    <p className="mb-4">
                        Puede gestionar sus preferencias de cookies de las siguientes formas:
                    </p>

                    <h3 className="text-lg font-medium text-white mb-2">4.1. Banner de consentimiento</h3>
                    <p className="mb-4">
                        En su primera visita al sitio, se le mostrará un banner donde puede aceptar o rechazar las cookies no esenciales.
                    </p>

                    <h3 className="text-lg font-medium text-white mb-2">4.2. Configuración del navegador</h3>
                    <p className="mb-4">
                        Puede configurar su navegador para bloquear o eliminar cookies. A continuación, le proporcionamos enlaces a las instrucciones de los navegadores más comunes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Safari</a></li>
                        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Microsoft Edge</a></li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mb-2 mt-6">4.3. Opt-out de Google Analytics</h3>
                    <p>
                        Puede impedir que Google Analytics recopile sus datos instalando el complemento de inhabilitación para navegadores: <a href="https://tools.google.com/dlpage/gaoptout?hl=es" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Complemento de inhabilitación de Google Analytics</a>
                    </p>
                </div>

                {/* 5. Consecuencias de desactivar cookies */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">5. Consecuencias de Desactivar las Cookies</h2>
                    <p className="mb-4">
                        Si decide bloquear las cookies, algunas funciones del sitio web podrían no estar disponibles o funcionar incorrectamente:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Si bloquea las cookies de sesión, no podrá iniciar sesión ni utilizar los servicios que requieren autenticación.</li>
                        <li>Si bloquea las cookies de pago, no podrá realizar recargas de saldo.</li>
                        <li>Si bloquea las cookies analíticas, no afectará a la funcionalidad del sitio, pero nos impedirá mejorar el servicio basándonos en datos de uso.</li>
                    </ul>
                </div>

                {/* 6. Actualización */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">6. Actualizaciones de esta Política</h2>
                    <p>
                        Esta Política de Cookies puede ser actualizada periódicamente para reflejar cambios en las cookies que utilizamos o por otros motivos operativos, legales o regulatorios. Le recomendamos revisar esta política cada vez que visite nuestro sitio web.
                    </p>
                </div>

                {/* 7. Contacto */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">7. Más Información</h2>
                    <p className="mb-4">
                        Para obtener más información sobre cómo tratamos sus datos personales, consulte nuestra <Link href="/legal/politica-privacidad" className="text-blue-400 hover:underline">Política de Privacidad</Link>.
                    </p>
                    <p>
                        Si tiene preguntas sobre nuestra Política de Cookies, puede contactar con nosotros en <strong className="text-blue-400">info@keywordtracker.es</strong>.
                    </p>
                </div>

            </section>
        </div>
    );
}
