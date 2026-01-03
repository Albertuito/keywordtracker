import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { keyword, country = 'es', language = 'es' } = await req.json();

        if (!keyword || keyword.trim().length === 0) {
            return NextResponse.json({ error: 'Keyword requerida' }, { status: 400 });
        }

        // Get location code for DataForSEO
        const locationCodes: Record<string, number> = {
            'es': 2724,  // Spain
            'mx': 2484,  // Mexico
            'ar': 2032,  // Argentina
            'us': 2840,  // USA
            'uk': 2826,  // UK
        };

        const locationCode = locationCodes[country] || 2724;

        // Call DataForSEO Extended SERP API (TOP 10)
        const serpResults = await DataForSEO.getSerpExtended(keyword.trim(), locationCode, language);

        if (!serpResults || serpResults.length === 0) {
            return NextResponse.json({ error: 'No se pudieron obtener resultados SERP' }, { status: 500 });
        }

        // Return analyzed SERP data
        return NextResponse.json({
            success: true,
            keyword: keyword.trim(),
            country,
            language,
            results: serpResults,
            analyzedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('SERP Analysis Error:', error);
        return NextResponse.json({ error: 'Error al analizar SERP' }, { status: 500 });
    }
}
