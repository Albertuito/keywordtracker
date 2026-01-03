export class DataForSEO {
    private static baseUrl = 'https://api.dataforseo.com/v3';

    private static get headers() {
        // Use environment variables for security
        const login = process.env.DATAFORSEO_LOGIN;
        const password = process.env.DATAFORSEO_PASSWORD;

        if (!login || !password) throw new Error("DataForSEO credentials missing in .env");

        const auth = Buffer.from(`${login}:${password}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get Money Balance
     */
    static async getAccountBalance(): Promise<number | null> {
        try {
            // DataForSEO uses GET (not POST) for /appendix/user_data
            const res = await fetch(`${this.baseUrl}/appendix/user_data`, {
                method: 'GET',
                headers: this.headers
            });
            const data = await res.json();
            if (data.tasks?.[0]?.result?.[0]) {
                const result = data.tasks[0].result[0];
                // money.balance contains available credits
                return result.money?.balance ?? null;
            }
            return null;
        } catch (error) {
            console.error('DataForSEO Balance Error:', error);
            return null;
        }
    }

    /**
     * Get Keyword Ideas (DataForSEO Labs - Better quality)
     * Returns keyword suggestions with difficulty, intent, and more metrics
     */
    static async getKeywordIdeas(
        keyword: string,
        country: string = 'es',
        limit: number = 50
    ): Promise<Array<{
        keyword: string;
        volume: number;
        difficulty: number;
        intent: string;
        cpc: number;
        competition: number;
    }> | null> {
        try {
            const postData = [{
                keywords: [keyword],
                language_code: country === 'es' ? 'es' : 'en',
                location_code: country === 'es' ? 2724 : 2840, // Spain or US
                limit: limit,
                include_seed_keyword: false,
                include_serp_info: false
            }];

            const res = await fetch(`${this.baseUrl}/dataforseo_labs/google/keyword_ideas/live`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });

            const data = await res.json();
            console.log('DataForSEO Keyword Ideas Response status:', data.status_code);

            if (data.tasks?.[0]?.result?.[0]?.items) {
                const results = data.tasks[0].result[0].items
                    .slice(0, limit)
                    .map((item: any) => ({
                        keyword: item.keyword,
                        volume: item.keyword_info?.search_volume || 0,
                        difficulty: item.keyword_properties?.keyword_difficulty || 0,
                        intent: item.search_intent_info?.main_intent || 'unknown',
                        cpc: item.keyword_info?.cpc || 0,
                        competition: item.keyword_info?.competition_level || 0
                    }));
                return results;
            }

            console.error('DataForSEO Keyword Ideas Error:', data.status_message);
            return null;
        } catch (error) {
            console.error('DataForSEO Keyword Ideas Error:', error);
            return null;
        }
    }

    /**
     * Get Related Keywords (Legacy - Google Ads)
     * @deprecated Use getKeywordIdeas instead
     */
    static async getRelatedKeywords(
        keyword: string,
        country: string = 'es',
        limit: number = 100
    ): Promise<Array<{
        keyword: string;
        volume: number;
        competition: string;
        cpc: number;
    }> | null> {
        try {
            const postData = [{
                keywords: [keyword],
                language_code: country === 'es' ? 'es' : 'en',
                location_code: country === 'es' ? 2724 : 2840,
                sort_by: 'search_volume',
                include_adult_keywords: false
            }];

            const res = await fetch(`${this.baseUrl}/keywords_data/google_ads/keywords_for_keywords/live`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });

            const data = await res.json();
            if (data.tasks?.[0]?.result) {
                return data.tasks[0].result.slice(0, limit).map((item: any) => ({
                    keyword: item.keyword,
                    volume: item.search_volume || 0,
                    competition: item.competition || 'UNKNOWN',
                    cpc: item.cpc || 0
                }));
            }
            return null;
        } catch (error) {
            console.error('DataForSEO Related Keywords Error:', error);
            return null;
        }
    }

    /**
     * Fetch Live Google Organic SERP
     */
    static async getRankings(keyword: string, country: string = 'es', device: string = 'desktop') {
        const postData = [{
            language_code: country === 'es' ? 'es' : 'en',
            location_code: country === 'es' ? 2724 : 2840,
            keyword: keyword,
            device: device,
            depth: 100
        }];

        try {
            const res = await fetch(`${this.baseUrl}/serp/google/organic/live/advanced`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items) {
                return data.tasks[0].result[0].items;
            }
            console.error('DataForSEO SERP Error:', JSON.stringify(data));
            return null;
        } catch (error) {
            console.error('DataForSEO Fetch Error:', error);
            return null;
        }
    }

    /**
     * Fetch Search Volume (Live)
     */
    static async getVolumes(keywords: string[], country: string = 'es') {
        const countryConfig: Record<string, { location_code: number, language_code: string }> = {
            'ES': { location_code: 2724, language_code: 'es' },
            'MX': { location_code: 2484, language_code: 'es' },
            'AR': { location_code: 2032, language_code: 'es' },
            'CO': { location_code: 2170, language_code: 'es' },
            'CL': { location_code: 2152, language_code: 'es' },
            'PE': { location_code: 2604, language_code: 'es' },
            'US': { location_code: 2840, language_code: 'en' },
            'GB': { location_code: 2826, language_code: 'en' },
            'FR': { location_code: 2250, language_code: 'fr' },
            'DE': { location_code: 2276, language_code: 'de' },
            'IT': { location_code: 2380, language_code: 'it' },
            'PT': { location_code: 2620, language_code: 'pt' },
            'BR': { location_code: 2076, language_code: 'pt' },
        };

        const config = countryConfig[country.toUpperCase()] || countryConfig['ES'];

        const postData = [{
            location_code: config.location_code,
            language_code: config.language_code,
            keywords: keywords
        }];

        try {
            const res = await fetch(`${this.baseUrl}/keywords_data/google_ads/search_volume/live`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result) {
                const volumes: Record<string, { volume: number, cpc: number, competition: number, competition_index: number }> = {};
                for (const item of data.tasks[0].result) {
                    volumes[item.keyword] = {
                        volume: item.search_volume || 0,
                        cpc: item.cpc || 0,
                        competition: item.competition || 0,
                        competition_index: item.competition_index || 0
                    };
                }
                return volumes;
            }
            console.error('DataForSEO Volume Error:', JSON.stringify(data));
            return null;
        } catch (error) {
            console.error('DataForSEO Volume Fetch Error:', error);
            return null;
        }
    }

    /**
     * Enqueue Standard SERP Task
     */
    static async enqueueRankings(keywords: { term: string, country: string, device: string, id: string }[]) {
        // DataForSEO location codes and language codes by country
        const countryConfig: Record<string, { location_code: number, language_code: string }> = {
            'ES': { location_code: 2724, language_code: 'es' },   // Spain
            'MX': { location_code: 2484, language_code: 'es' },   // Mexico
            'AR': { location_code: 2032, language_code: 'es' },   // Argentina
            'CO': { location_code: 2170, language_code: 'es' },   // Colombia
            'CL': { location_code: 2152, language_code: 'es' },   // Chile
            'PE': { location_code: 2604, language_code: 'es' },   // Peru
            'US': { location_code: 2840, language_code: 'en' },   // United States
            'GB': { location_code: 2826, language_code: 'en' },   // United Kingdom
            'FR': { location_code: 2250, language_code: 'fr' },   // France
            'DE': { location_code: 2276, language_code: 'de' },   // Germany
            'IT': { location_code: 2380, language_code: 'it' },   // Italy
            'PT': { location_code: 2620, language_code: 'pt' },   // Portugal
            'BR': { location_code: 2076, language_code: 'pt' },   // Brazil
        };

        const postData = keywords.map(k => {
            const config = countryConfig[k.country.toUpperCase()] || countryConfig['ES']; // Default to Spain
            return {
                language_code: config.language_code,
                location_code: config.location_code,
                keyword: k.term,
                device: k.device || 'desktop',
                priority: 1,
                tag: k.id,
                depth: 100
            };
        });

        try {
            const res = await fetch(`${this.baseUrl}/serp/google/organic/task_post`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks) {
                const tasks: Record<string, string> = {};
                data.tasks.forEach((t: any) => {
                    if (t.data?.tag && t.id) {
                        tasks[t.data.tag] = t.id;
                    }
                });
                return tasks;
            }
            return null;
        } catch (error) {
            console.error('DataForSEO Enqueue Network Error:', error);
            return null;
        }
    }

    /**
     * Get Results for a Task ID
     */
    static async getTaskResults(taskId: string) {
        try {
            const res = await fetch(`${this.baseUrl}/serp/google/organic/task_get/regular/${taskId}`, {
                method: 'GET',
                headers: this.headers
            });
            const data = await res.json();
            if (data.status_code === 20000 && data.tasks?.[0]) {
                return data.tasks[0];
            }
            return null;
        } catch (error) {
            console.error(`DataForSEO Result Fetch Error (${taskId}):`, error);
            return null;
        }
    }


    /**
     * Get SERP results for a keyword (Top 5 for competitors)
     */
    static async getSERP(keyword: string, locationCode: number = 2724, languageCode: string = 'es') {
        const postData = [{
            keyword,
            location_code: locationCode,
            language_code: languageCode,
            depth: 10,
            device: 'desktop'
        }];

        try {
            const res = await fetch(`${this.baseUrl}/serp/google/organic/live/advanced`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();
            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items) {
                // Return top 5 organic results
                return data.tasks[0].result[0].items
                    .filter((i: any) => i.type === 'organic')
                    .slice(0, 5);
            }
            return [];
        } catch (error) {
            console.error('DataForSEO SERP Fetch Error:', error);
            return [];
        }
    }

    /**
     * Get Extended SERP results for content generator (TOP 10 with rich data)
     */
    static async getSerpExtended(keyword: string, locationCode: number = 2724, languageCode: string = 'es') {
        const postData = [{
            keyword,
            location_code: locationCode,
            language_code: languageCode,
            depth: 20, // Get more to ensure 10 organic
            device: 'desktop'
        }];

        try {
            const res = await fetch(`${this.baseUrl}/serp/google/organic/live/advanced`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items) {
                const organicItems = data.tasks[0].result[0].items
                    .filter((i: any) => i.type === 'organic')
                    .slice(0, 10);

                // Extract rich data for each result
                return organicItems.map((item: any, index: number) => ({
                    position: index + 1,
                    url: item.url,
                    domain: item.domain,
                    title: item.title,
                    description: item.description,
                    breadcrumb: item.breadcrumb,
                    // SERP features
                    is_featured_snippet: item.is_featured_snippet || false,
                    is_sitelinks: !!item.links,
                    sitelinks_count: item.links?.length || 0,
                    // Content hints from SERP
                    faq: item.faq?.items?.map((f: any) => f.title) || [],
                    estimated_paid_traffic_cost: item.estimated_paid_traffic_cost || 0,
                    rank_absolute: item.rank_absolute,
                    // Related questions if available
                    related_questions: data.tasks[0].result[0].items
                        .filter((i: any) => i.type === 'people_also_ask')
                        .flatMap((i: any) => i.items?.map((q: any) => q.title) || [])
                        .slice(0, 5),
                }));
            }

            console.error('DataForSEO Extended SERP Error:', data.status_message);
            return [];
        } catch (error) {
            console.error('DataForSEO Extended SERP Fetch Error:', error);
            return [];
        }
    }

    /**
     * Get On-Page Instant Analysis
     */
    static async getOnPageInstant(url: string) {
        // MOCK MODE for Audit
        if (url.includes('demo') || url.includes('test')) {
            return {
                onpage_score: 85,
                meta: {
                    title: "Demo Page Title | RankTracker",
                    description: "This is a demo description for testing. It has the right length for Google SERP display.",
                    htags: { h1: ["Welcome to Demo"] },
                    content_info: { word_count: 450 }
                },
                page_timing: { download_time: 120 },
                checks: { is_broken: false, is_gzip: true, no_image_alt: true },
                content: "Esta es una página de ejemplo sobre coches de segunda mano. Comprar un coche barato es fácil si sabes cómo. Los coches usados son una gran opción..."
            };
        }

        const postData = [{
            url: url,
            load_resources: false,
            enable_javascript: false,
            validate_micromarkup: true,
            store_raw_html: true
        }];

        try {
            const res = await fetch(`${this.baseUrl}/on_page/instant_pages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items?.[0]) {
                const item = data.tasks[0].result[0].items[0];
                return item;
            }

            const task = data.tasks?.[0];
            const detail = task?.status_message || data.status_message || 'No results found';
            const code = task?.status_code || data.status_code;

            throw new Error(`DataForSEO Error (${code}): ${detail}`);
        } catch (error: any) {
            console.error('DataForSEO Instant Error:', error.message);
            throw error;
        }
    }
    static async getPageContent(url: string) {
        if (url.includes('demo') || url.includes('test')) {
            return "Esta es una página de ejemplo sobre coches de segunda mano. Comprar un coche barato es fácil si sabes cómo. Los coches usados son una gran opción para ahorrar dinero sin renunciar a la calidad. En nuestra web encontrarás las mejores ofertas.";
        }

        // Try content_parsing first
        const postData = [{ url }];
        try {
            const res = await fetch(`${this.baseUrl}/on_page/content_parsing`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items) {
                const items = data.tasks[0].result[0].items;
                // Try to get plain_text first, then paragraphs
                const plainText = items.find((item: any) => item.plain_text_content);
                if (plainText?.plain_text_content) {
                    return plainText.plain_text_content;
                }

                // Fallback: concatenate all text items
                return items
                    .filter((item: any) => item.type === 'text' || item.type === 'paragraph')
                    .map((item: any) => item.text || item.content || '')
                    .join(' ');
            }

            // Fallback to page result plain_text
            const pageResult = data.tasks?.[0]?.result?.[0];
            if (pageResult?.meta?.content?.plain_text_word_count > 0) {
                // Get text from meta if available
                return `Contenido no extraído directamente. Palabras detectadas: ${pageResult.meta.content.plain_text_word_count}`;
            }

            return "";
        } catch (error) {
            console.error('DataForSEO Content Parsing Error:', error);
            return "";
        }
    }

    /**
     * Get complete keyword data (volume, CPC, competition, difficulty) v3.2
     */
    static async getKeywordData(keyword: string, locationCode: number = 2724, languageCode: string = 'es') {
        const postData = [{
            location_code: locationCode,
            language_code: languageCode,
            keywords: [keyword]
        }];

        try {
            const res = await fetch(`${this.baseUrl}/keywords_data/google_ads/search_volume/live`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(postData)
            });
            const data = await res.json();

            if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]) {
                const result = data.tasks[0].result[0];
                return {
                    keyword: result.keyword,
                    search_volume: result.search_volume || 0,
                    cpc: result.cpc || 0,
                    competition: result.competition || 0,
                    competition_index: result.competition_index || 0,
                    low_top_of_page_bid: result.low_top_of_page_bid || 0,
                    high_top_of_page_bid: result.high_top_of_page_bid || 0,
                    monthly_searches: result.monthly_searches || []
                };
            }
            console.error('DataForSEO Keyword Data Error:', JSON.stringify(data));
            return null;
        } catch (error) {
            console.error('DataForSEO Keyword Data Fetch Error:', error);
            return null;
        }
    }
}
