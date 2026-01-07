import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aviso Legal | KeywordTracker',
    description: 'Información legal sobre KeywordTracker y condiciones de uso.',
};

export default function AvisoLegalPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8">Aviso Legal</h1>

            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">1. Identidad del titular</h2>
                    <p>
                        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que el titular del sitio web <strong>keywordtracker.es</strong> es:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Nombre:</strong> Alberto Martín Sánchez</li>
                        <li><strong>DNI:</strong> 32074025L</li>
                        <li><strong>Domicilio:</strong> Jerez de la Frontera, 11405 (Cádiz)</li>
                        <li><strong>Email de contacto:</strong> info@keywordtracker.es</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">2. Condiciones de uso</h2>
                    <p>
                        El usuario se compromete a hacer un uso diligente del sitio web y de los servicios accesibles desde el mismo, con total sujeción a la Ley, a las buenas costumbres y al presente Aviso Legal.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">3. Propiedad Intelectual e Industrial</h2>
                    <p>
                        Todos los contenidos del sitio web (textos, gráficos, logotipos, iconos, imágenes, etc.) son propiedad exclusiva de KeywordTracker o de terceros, quedando prohibida su reproducción o distribución sin autorización expresa.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">4. Exclusión de garantías y responsabilidad</h2>
                    <p>
                        El titular del sitio web no garantiza la disponibilidad y continuidad del funcionamiento del sitio web y de sus servicios. Asimismo, no será responsable de los daños y perjuicios de cualquier naturaleza que puedan derivarse de la falta de disponibilidad o continuidad del funcionamiento del sitio web.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-3">5. Ley aplicable y jurisdicción</h2>
                    <p>
                        Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales de Jerez de la Frontera (Cádiz).
                    </p>
                </div>
            </section>
        </div>
    );
}
