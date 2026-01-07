import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aviso Legal | KeywordTracker',
    description: 'Aviso legal y condiciones de uso de KeywordTracker.es',
};

export default function AvisoLegalPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Aviso Legal</h1>
            <p className="text-slate-400 mb-8">Última actualización: 7 de enero de 2026</p>

            <section className="space-y-8">

                {/* 1. Datos Identificativos */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">1. Datos Identificativos del Titular</h2>
                    <p className="mb-4">
                        En cumplimiento del deber de información establecido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan a continuación los datos identificativos del titular del sitio web:
                    </p>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-2">
                        <p><strong className="text-white">Titular:</strong> Alberto Martín Sánchez</p>
                        <p><strong className="text-white">DNI:</strong> 32074025L</p>
                        <p><strong className="text-white">Domicilio:</strong> Jerez de la Frontera, 11405 (Cádiz), España</p>
                        <p><strong className="text-white">Correo electrónico:</strong> info@keywordtracker.es</p>
                        <p><strong className="text-white">Sitio web:</strong> https://keywordtracker.es</p>
                    </div>
                </div>

                {/* 2. Objeto */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">2. Objeto y Ámbito de Aplicación</h2>
                    <p className="mb-4">
                        El presente Aviso Legal regula el acceso y uso del sitio web <strong className="text-white">keywordtracker.es</strong> (en adelante, "el Sitio Web"), así como las responsabilidades derivadas de su utilización.
                    </p>
                    <p className="mb-4">
                        KeywordTracker es una plataforma de monitorización de posicionamiento SEO en buscadores que permite a los usuarios realizar un seguimiento del ranking de sus palabras clave en Google y otros motores de búsqueda.
                    </p>
                    <p>
                        El acceso y uso del Sitio Web implica la aceptación expresa y sin reservas de todas las disposiciones incluidas en este Aviso Legal, así como en la Política de Privacidad y la Política de Cookies.
                    </p>
                </div>

                {/* 3. Condiciones de Uso */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">3. Condiciones Generales de Uso</h2>
                    <p className="mb-4">El usuario se compromete a:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Hacer un uso adecuado y lícito del Sitio Web y de los servicios ofrecidos, de conformidad con la legislación aplicable, la moral, las buenas costumbres y el orden público.</li>
                        <li>No realizar actividades ilícitas o lesivas de los derechos e intereses del titular o de terceros.</li>
                        <li>No introducir o difundir virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar daños en los sistemas informáticos del titular o de terceros.</li>
                        <li>No intentar acceder, utilizar y/o manipular los datos del titular, terceros proveedores y otros usuarios.</li>
                        <li>No reproducir, copiar, distribuir, poner a disposición, comunicar públicamente, transformar o modificar los contenidos, salvo autorización expresa del titular.</li>
                        <li>No suprimir, ocultar o manipular los avisos sobre derechos de propiedad intelectual o industrial y demás datos identificativos de los derechos del titular incorporados a los contenidos.</li>
                    </ul>
                    <p>
                        El titular se reserva el derecho a denegar o retirar el acceso al Sitio Web y/o los servicios en cualquier momento, sin necesidad de preaviso, a aquellos usuarios que incumplan estas Condiciones Generales.
                    </p>
                </div>

                {/* 4. Registro y Cuenta de Usuario */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">4. Registro y Cuenta de Usuario</h2>
                    <p className="mb-4">
                        Para acceder a determinados servicios del Sitio Web, el usuario deberá registrarse creando una cuenta de usuario. El usuario garantiza que toda la información facilitada durante el proceso de registro es veraz, completa y actualizada.
                    </p>
                    <p className="mb-4">
                        El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que se realicen bajo su cuenta. En caso de uso no autorizado de la cuenta, el usuario deberá notificarlo inmediatamente a info@keywordtracker.es.
                    </p>
                    <p>
                        El titular se reserva el derecho de cancelar cuentas de usuario que incumplan estas condiciones o que permanezcan inactivas durante un período prolongado.
                    </p>
                </div>

                {/* 5. Sistema de Pagos */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">5. Sistema de Pagos y Facturación</h2>
                    <p className="mb-4">
                        KeywordTracker opera bajo un modelo de prepago. Los usuarios adquieren saldo que se consume conforme utilizan los servicios de la plataforma.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">Precios:</strong> Los precios de cada servicio están indicados en euros (€) e incluyen el IVA aplicable. El coste por consulta de posición de keyword es de 0,05€ (cola estándar) o 0,09€ (modo instantáneo).
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">Métodos de pago:</strong> Se aceptan pagos mediante tarjeta de crédito/débito (a través de Stripe) y PayPal.
                    </p>
                    <p className="mb-4">
                        <strong className="text-white">Recargas mínimas:</strong> La recarga mínima es de 5€.
                    </p>
                    <p>
                        <strong className="text-white">Política de devoluciones:</strong> El saldo no utilizado no es reembolsable salvo en casos excepcionales debidamente justificados. Para solicitar una devolución, contacte con info@keywordtracker.es.
                    </p>
                </div>

                {/* 6. Propiedad Intelectual */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">6. Propiedad Intelectual e Industrial</h2>
                    <p className="mb-4">
                        Todos los contenidos del Sitio Web, incluyendo sin carácter limitativo: textos, fotografías, gráficos, imágenes, iconos, tecnología, software, enlaces y demás contenidos audiovisuales, así como su diseño gráfico y códigos fuente, son propiedad intelectual del titular o de terceros, sin que pueda entenderse cedido al usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual.
                    </p>
                    <p className="mb-4">
                        Las marcas, nombres comerciales o signos distintivos son titularidad del titular o de terceros, sin que el acceso al Sitio Web atribuya al usuario derecho alguno sobre los citados signos distintivos.
                    </p>
                    <p>
                        Se prohíbe expresamente la reproducción, transformación, distribución, comunicación pública, puesta a disposición, extracción, reutilización o cualquier otra forma de explotación de los contenidos del Sitio Web sin autorización previa y por escrito del titular.
                    </p>
                </div>

                {/* 7. Exclusión de Garantías */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">7. Exclusión de Garantías y Responsabilidad</h2>
                    <p className="mb-4">El titular no garantiza:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>La disponibilidad y continuidad del funcionamiento del Sitio Web y de los servicios.</li>
                        <li>La ausencia de errores en los contenidos ni la corrección de cualquier defecto que pudiera ocurrir.</li>
                        <li>La ausencia de virus y/o demás componentes dañinos en el Sitio Web o en el servidor que lo suministra.</li>
                        <li>La invulnerabilidad del Sitio Web y/o la inexpugnabilidad de las medidas de seguridad que se adopten.</li>
                        <li>La exactitud, fiabilidad o actualidad de los datos de posicionamiento SEO, que dependen de fuentes externas.</li>
                    </ul>
                    <p className="mb-4">
                        El titular no será responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la falta de disponibilidad, continuidad o calidad del funcionamiento del Sitio Web y de los servicios, ni del incumplimiento de la expectativa de utilidad que el usuario hubiere podido atribuir al Sitio Web.
                    </p>
                    <p>
                        En ningún caso la responsabilidad del titular, si la hubiere, excederá del importe total abonado por el usuario en los últimos 12 meses.
                    </p>
                </div>

                {/* 8. Enlaces */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">8. Enlaces a Terceros</h2>
                    <p className="mb-4">
                        El Sitio Web puede contener enlaces a sitios web de terceros. El titular no asume ninguna responsabilidad sobre el contenido, información o servicios que pudieran aparecer en dichos sitios, que tienen carácter meramente informativo y que en ningún caso implican relación alguna entre el titular y las personas o entidades titulares de tales contenidos.
                    </p>
                </div>

                {/* 9. Modificaciones */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">9. Modificaciones</h2>
                    <p>
                        El titular se reserva el derecho a modificar, en cualquier momento y sin previo aviso, la presentación, configuración y contenidos del Sitio Web, así como las condiciones requeridas para su acceso y uso. El usuario es responsable de revisar periódicamente el presente Aviso Legal.
                    </p>
                </div>

                {/* 10. Legislación y Jurisdicción */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">10. Legislación Aplicable y Jurisdicción</h2>
                    <p className="mb-4">
                        La relación entre el titular y el usuario se regirá por la legislación española vigente. Cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Jerez de la Frontera (Cádiz), salvo que la normativa aplicable disponga otra cosa.
                    </p>
                    <p>
                        En caso de que el usuario tenga su domicilio fuera de España, el titular y el usuario renuncian expresamente a cualquier otro fuero, sometiéndose a los Juzgados y Tribunales de Jerez de la Frontera (Cádiz) para la resolución de cuantos litigios pudieran derivarse.
                    </p>
                </div>

                {/* 11. Contacto */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">11. Contacto</h2>
                    <p>
                        Para cualquier consulta o reclamación relacionada con el Sitio Web o los servicios, puede contactar con el titular a través del correo electrónico <strong className="text-blue-400">info@keywordtracker.es</strong>.
                    </p>
                </div>

            </section>
        </div>
    );
}
