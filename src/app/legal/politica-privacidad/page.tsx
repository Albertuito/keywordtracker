import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad | KeywordTracker',
    description: 'Cómo tratamos tus datos personales en KeywordTracker.',
};

export default function PoliticaPrivacidadPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Política de Privacidad</h1>

            <section className="space-y-6">
                <p>
                    En <strong>KeywordTracker</strong> estamos comprometidos con la protección de la privacidad y el uso correcto de los datos personales.
                </p>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
                    <p>
                        Los datos personales recabados a través de este sitio web serán tratados por <strong>[Nombre o Razón Social]</strong>, con CIF [CIF/NIF] y email de contacto info@keywordtracker.es.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">2. Finalidad del tratamiento</h2>
                    <p>
                        Sus datos personales serán utilizados para:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Gestionar su registro y cuenta de usuario.</li>
                        <li>Procesar los pagos y recargas de saldo (Stripe/PayPal).</li>
                        <li>Enviar notificaciones relacionadas con el servicio.</li>
                        <li>Atender sus consultas y solicitudes de soporte.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">3. Legitimación</h2>
                    <p>
                        La base legal para el tratamiento de sus datos es la ejecución del contrato de prestación de servicios y/o su consentimiento expreso al registrarse o contactarnos.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">4. Destinatarios de los datos</h2>
                    <p>
                        Sus datos no se cederán a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio (ej. pasarelas de pago como Stripe o PayPal, proveedores de hosting).
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">5. Derechos del usuario</h2>
                    <p>
                        Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un email a <strong>info@keywordtracker.es</strong>.
                    </p>
                </div>
            </section>
        </div>
    );
}
