import { PrismaClient } from '@prisma/client';
import { logWorker } from './logger';

const prisma = new PrismaClient();

// Función auxiliar para normalizar dominio
function normalizeDomain(url: string): string {
    try {
        // Remover protocolo y www
        return url
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]  // Solo el dominio, sin path
            .toLowerCase();
    } catch {
        return url.toLowerCase();
    }
}

export async function processKeywordCheck(keywordId: string) {
    logWorker(`Procesando keyword: ${keywordId}`);

    // 1. Obtener keyword
    const keyword = await prisma.keyword.findUnique({
        where: { id: keywordId },
        include: { project: true }
    });

    if (!keyword) {
        logWorker(`Keyword ${keywordId} no encontrada`);
        return;
    }

    // 2. Ejecutar búsqueda con paginación
    let position = 0;
    let foundUrl = '';

    if (process.env.SERPAPI_KEY) {
        try {
            const { getJson } = require("serpapi");
            logWorker(`Consultando SerpApi para: "${keyword.term}" (${keyword.country}, ${keyword.device})`);

            const getResults = (params: any) => new Promise<any>((resolve, reject) => {
                getJson(params, (data: any) => {
                    if (data.error) {
                        reject(new Error(data.error));
                    } else {
                        resolve(data);
                    }
                });
            });

            const targetDomain = normalizeDomain(keyword.project.domain);
            logWorker(`Buscando dominio: "${targetDomain}"`);

            // Hacer hasta 10 peticiones (100 resultados) o hasta encontrar el dominio
            for (let page = 0; page < 10; page++) {
                const startIndex = page * 10;

                logWorker(`Consultando página ${page + 1} (resultados ${startIndex + 1}-${startIndex + 10})...`);

                const response = await getResults({
                    engine: "google",
                    api_key: process.env.SERPAPI_KEY,
                    q: keyword.term,
                    gl: keyword.country,
                    hl: keyword.country === 'es' ? 'es' : 'en',
                    device: keyword.device,
                    start: startIndex
                });

                const organic = response.organic_results || [];

                if (organic.length === 0) {
                    logWorker(`No hay más resultados después de la página ${page + 1}`);
                    break;
                }

                // Buscar en los resultados de esta página
                for (let i = 0; i < organic.length; i++) {
                    const result = organic[i];
                    const resultDomain = normalizeDomain(result.link || '');
                    const currentPosition = startIndex + i + 1;

                    if (resultDomain.includes(targetDomain) || targetDomain.includes(resultDomain)) {
                        position = currentPosition;
                        foundUrl = result.link;
                        logWorker(`✓ ENCONTRADO en posición ${position}: ${foundUrl}`);
                        break;
                    }
                }

                // Si ya lo encontramos, salir del loop de paginación
                if (position > 0) {
                    break;
                }

                // Pequeño delay para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (position === 0) {
                logWorker(`✗ NO ENCONTRADO en los primeros 100 resultados.`);
                logWorker(`Dominio objetivo: ${targetDomain}`);
            }

        } catch (e: any) {
            logWorker(`Error SerpApi: ${e?.message || e}`);
        }
    } else {
        // MOCK FALLBACK
        logWorker("SERPAPI_KEY no configurada. Usando Mock.");
        position = Math.floor(Math.random() * 100) + 1;
        foundUrl = `https://mock-result.com/${keyword.term}`;
    }

    // 3. Guardar resultado
    await prisma.keywordPosition.create({
        data: {
            keywordId: keyword.id,
            position: position,
            url: foundUrl || null,
            date: new Date()
        }
    });

    logWorker(`Guardado: pos=${position}, url=${foundUrl || 'N/A'}`);
}


export async function triggerDailyChecks() {
    logWorker("Iniciando checks diarios...");
    const keywords = await prisma.keyword.findMany();

    // Procesar en serie para no saturar
    for (const k of keywords) {
        await processKeywordCheck(k.id);
    }

    return { processed: keywords.length };
}
