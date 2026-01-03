const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

async function testSerpFreshness() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
        console.error("❌ Credenciales faltantes en .env");
        process.exit(1);
    }

    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    console.log("🔍 Buscando SERP para 'mejores freidoras de aire' buscando fechas antiguas...");

    try {
        const response = await axios.post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', [
            {
                keyword: "mejores freidoras de aire 2020", // Force unlikely old content if possible, or just standard query
                location_code: 2724, // Spain
                language_code: "es",
                device: "desktop",
                depth: 10
            }
        ], {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const tasks = response.data.tasks;
        if (!tasks || !tasks[0].result) {
            console.log("❌ No se encontraron resultados o error en API:", JSON.stringify(response.data));
            return;
        }

        const items = tasks[0].result[0].items;
        console.log(`✅ SERP extraída con ${items.length} resultados:\n`);

        items.forEach((item, i) => {
            if (item.type !== 'organic') return;

            // Try to find date info
            // DataForSEO often puts date in 'snippet' or specific field if wealthy snippet
            const date = item.publication_date || item.date || "No fecha detectada";

            console.log(`[#${item.rank_group}] ${item.title}`);
            console.log(`🔗 ${item.url}`);
            console.log(`📅 Fecha/Snippet: ${date}`);
            if (item.snippet) console.log(`📝 Snippet: ${item.snippet.substring(0, 50)}...`);
            console.log('--------------------------------------------------');
        });

    } catch (e) {
        console.error("❌ Error:", e.response ? JSON.stringify(e.response.data) : e.message);
    }
}

testSerpFreshness();
