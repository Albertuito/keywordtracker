import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad | KeywordTracker',
    description: 'Política de privacidad y protección de datos de KeywordTracker.es conforme al RGPD y LOPD-GDD.',
};

export default function PoliticaPrivacidadPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Política de Privacidad</h1>
            <p className="text-slate-400 mb-8">Última actualización: 7 de enero de 2026</p>

            <section className="space-y-8">

                {/* Introducción */}
                <div>
                    <p className="mb-4">
                        En <strong className="text-white">KeywordTracker</strong> (en adelante, "nosotros" o "el Responsable") nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información personal de conformidad con el Reglamento General de Protección de Datos (RGPD) (UE) 2016/679 y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD).
                    </p>
                </div>

                {/* 1. Responsable del Tratamiento */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">1. Responsable del Tratamiento</h2>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-2">
                        <p><strong className="text-white">Responsable:</strong> Alberto Martín Sánchez</p>
                        <p><strong className="text-white">DNI:</strong> 32074025L</p>
                        <p><strong className="text-white">Domicilio:</strong> Jerez de la Frontera, 11405 (Cádiz), España</p>
                        <p><strong className="text-white">Correo electrónico:</strong> info@keywordtracker.es</p>
                    </div>
                </div>

                {/* 2. Datos que Recopilamos */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">2. Datos Personales que Recopilamos</h2>
                    <p className="mb-4">Podemos recopilar los siguientes tipos de datos personales:</p>

                    <h3 className="text-lg font-medium text-white mb-2">2.1. Datos proporcionados por el usuario:</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li><strong className="text-white">Datos de registro:</strong> nombre, dirección de correo electrónico y contraseña (almacenada de forma cifrada).</li>
                        <li><strong className="text-white">Datos de facturación:</strong> información necesaria para procesar pagos (gestionados por Stripe y PayPal, nosotros no almacenamos datos de tarjetas).</li>
                        <li><strong className="text-white">Datos de contacto:</strong> información proporcionada a través de formularios de contacto o tickets de soporte.</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mb-2">2.2. Datos recopilados automáticamente:</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li><strong className="text-white">Datos de uso:</strong> información sobre cómo utiliza nuestros servicios (páginas visitadas, funciones utilizadas, etc.).</li>
                        <li><strong className="text-white">Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, zona horaria y datos de cookies.</li>
                        <li><strong className="text-white">Datos de análisis:</strong> recopilados a través de Google Analytics 4 (ver Política de Cookies).</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mb-2">2.3. Datos relativos al servicio:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Proyectos y keywords:</strong> dominios y palabras clave que el usuario desea monitorizar.</li>
                        <li><strong className="text-white">Historial de transacciones:</strong> recargas de saldo y consumos del servicio.</li>
                    </ul>
                </div>

                {/* 3. Finalidad del Tratamiento */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">3. Finalidad del Tratamiento de Datos</h2>
                    <p className="mb-4">Tratamos sus datos personales para las siguientes finalidades:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Prestación del servicio:</strong> gestionar su cuenta de usuario, procesar proyectos y keywords, y proporcionar los resultados de monitorización SEO.</li>
                        <li><strong className="text-white">Gestión de pagos:</strong> procesar recargas de saldo y gestionar la facturación.</li>
                        <li><strong className="text-white">Comunicaciones de servicio:</strong> enviar notificaciones relacionadas con su cuenta, como confirmaciones de registro, alertas de saldo bajo o cambios en el servicio.</li>
                        <li><strong className="text-white">Soporte al cliente:</strong> atender sus consultas, reclamaciones o solicitudes de asistencia técnica.</li>
                        <li><strong className="text-white">Mejora del servicio:</strong> analizar el uso de la plataforma para mejorar funcionalidades y experiencia de usuario.</li>
                        <li><strong className="text-white">Cumplimiento legal:</strong> cumplir con obligaciones legales aplicables.</li>
                    </ul>
                </div>

                {/* 4. Base Legal */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">4. Base Legal del Tratamiento</h2>
                    <p className="mb-4">El tratamiento de sus datos está basado en:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Ejecución de un contrato:</strong> el tratamiento es necesario para la ejecución del contrato de prestación de servicios al que usted se adhiere al registrarse.</li>
                        <li><strong className="text-white">Consentimiento:</strong> usted ha dado su consentimiento para el tratamiento de sus datos para una o varias finalidades específicas (por ejemplo, cookies de análisis).</li>
                        <li><strong className="text-white">Interés legítimo:</strong> el tratamiento es necesario para la satisfacción de intereses legítimos perseguidos por el Responsable (por ejemplo, prevención del fraude, mejora del servicio).</li>
                        <li><strong className="text-white">Obligación legal:</strong> el tratamiento es necesario para el cumplimiento de una obligación legal.</li>
                    </ul>
                </div>

                {/* 5. Destinatarios */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">5. Destinatarios de los Datos</h2>
                    <p className="mb-4">Sus datos personales podrán ser comunicados a los siguientes destinatarios:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Procesadores de pago:</strong> Stripe, Inc. y PayPal Holdings, Inc. para gestionar transacciones de pago. Estas empresas tienen sus propias políticas de privacidad y actúan como encargados del tratamiento.</li>
                        <li><strong className="text-white">Proveedores de hosting:</strong> Vercel Inc. proporciona la infraestructura de alojamiento. Los datos se almacenan en servidores ubicados en la Unión Europea.</li>
                        <li><strong className="text-white">Servicios de análisis:</strong> Google LLC (Google Analytics 4) para analizar el uso del sitio web, previa aceptación de cookies.</li>
                        <li><strong className="text-white">Autoridades públicas:</strong> cuando sea requerido por ley o para proteger nuestros derechos legales.</li>
                    </ul>
                    <p className="mt-4">
                        No vendemos, alquilamos ni compartimos sus datos personales con terceros con fines de marketing sin su consentimiento explícito.
                    </p>
                </div>

                {/* 6. Transferencias Internacionales */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">6. Transferencias Internacionales de Datos</h2>
                    <p className="mb-4">
                        Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo (EEE). En estos casos, nos aseguramos de que existan garantías adecuadas para la protección de sus datos, tales como:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Cláusulas contractuales tipo aprobadas por la Comisión Europea.</li>
                        <li>Decisiones de adecuación de la Comisión Europea (cuando aplique).</li>
                        <li>Certificaciones o códigos de conducta aprobados.</li>
                    </ul>
                </div>

                {/* 7. Conservación de Datos */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">7. Plazo de Conservación de los Datos</h2>
                    <p className="mb-4">Conservaremos sus datos personales durante los siguientes períodos:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Datos de cuenta:</strong> mientras su cuenta permanezca activa y durante el período necesario para cumplir con obligaciones legales (mínimo 5 años por obligaciones fiscales).</li>
                        <li><strong className="text-white">Datos de facturación:</strong> 5 años conforme a la legislación fiscal española.</li>
                        <li><strong className="text-white">Datos de soporte:</strong> 2 años desde la resolución de la consulta.</li>
                        <li><strong className="text-white">Datos de análisis:</strong> según la configuración de retención de Google Analytics (actualmente 14 meses).</li>
                    </ul>
                    <p className="mt-4">
                        Una vez transcurridos estos plazos, los datos serán suprimidos o anonimizados.
                    </p>
                </div>

                {/* 8. Derechos del Usuario */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">8. Derechos del Usuario</h2>
                    <p className="mb-4">De acuerdo con el RGPD, usted tiene los siguientes derechos:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong className="text-white">Derecho de acceso:</strong> obtener confirmación de si tratamos sus datos y acceder a ellos.</li>
                        <li><strong className="text-white">Derecho de rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
                        <li><strong className="text-white">Derecho de supresión ("derecho al olvido"):</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios para los fines para los que fueron recogidos.</li>
                        <li><strong className="text-white">Derecho de oposición:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
                        <li><strong className="text-white">Derecho a la limitación del tratamiento:</strong> solicitar la limitación del tratamiento en determinados supuestos.</li>
                        <li><strong className="text-white">Derecho a la portabilidad:</strong> recibir sus datos en un formato estructurado, de uso común y lectura mecánica.</li>
                        <li><strong className="text-white">Derecho a retirar el consentimiento:</strong> cuando el tratamiento se base en el consentimiento, puede retirarlo en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
                    </ul>
                    <p className="mt-4">
                        Para ejercer cualquiera de estos derechos, puede enviar un correo electrónico a <strong className="text-blue-400">info@keywordtracker.es</strong> indicando el derecho que desea ejercer y acompañando copia de su DNI o documento identificativo equivalente.
                    </p>
                    <p className="mt-4">
                        Asimismo, le informamos de su derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos no se ajusta a la normativa vigente (www.aepd.es).
                    </p>
                </div>

                {/* 9. Seguridad */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">9. Medidas de Seguridad</h2>
                    <p className="mb-4">
                        Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Cifrado SSL/TLS para todas las comunicaciones.</li>
                        <li>Almacenamiento cifrado de contraseñas mediante algoritmos de hash seguros (bcrypt).</li>
                        <li>Acceso restringido a los datos personales solo al personal autorizado.</li>
                        <li>Copias de seguridad periódicas.</li>
                        <li>Monitorización de seguridad continua.</li>
                    </ul>
                </div>

                {/* 10. Menores */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">10. Menores de Edad</h2>
                    <p>
                        Nuestros servicios no están dirigidos a menores de 14 años. No recopilamos conscientemente datos personales de menores de 14 años. Si tiene conocimiento de que un menor nos ha proporcionado datos personales sin el consentimiento de sus padres o tutores, póngase en contacto con nosotros para que podamos eliminar dicha información.
                    </p>
                </div>

                {/* 11. Modificaciones */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">11. Modificaciones de esta Política</h2>
                    <p>
                        Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será publicado en esta página con la fecha de última actualización. Le recomendamos revisar periódicamente esta política para estar informado sobre cómo protegemos sus datos.
                    </p>
                </div>

                {/* 12. Contacto */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">12. Contacto</h2>
                    <p>
                        Si tiene preguntas, comentarios o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactar con nosotros en <strong className="text-blue-400">info@keywordtracker.es</strong>.
                    </p>
                </div>

            </section>
        </div>
    );
}
