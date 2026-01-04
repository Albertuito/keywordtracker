import FreshnessTool from '@/components/research/FreshnessTool';


export const metadata = {
    title: 'Freshness Gap Detector | KeywordTracker',
    description: 'Encuentra oportunidades de contenido desactualizado.',
};

export default function FreshnessPage() {
    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-12">
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Research Tools</h1>
                <p className="text-slate-300">Herramientas avanzadas de análisis SERP.</p>
            </div>

            <FreshnessTool />
        </div>
    );
}

