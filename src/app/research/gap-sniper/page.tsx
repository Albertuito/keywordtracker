import GapSniper from '@/components/research/GapSniper';

export const metadata = {
    title: 'El Matagigantes (Forum Sniper) | KeywordTracker',
    description: 'Encuentra keywords donde rankean foros y webs débiles.',
};

export default function GapSniperPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Tools</h1>
                <p className="text-gray-600">Herramientas avanzadas de análisis SERP.</p>
            </div>

            <GapSniper />
        </div>
    );
}
