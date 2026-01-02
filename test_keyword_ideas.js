// Test DataForSEO Keyword Ideas API
require('dotenv').config();

const login = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!login || !password) {
    console.error('Missing DATAFORSEO credentials');
    process.exit(1);
}

const auth = Buffer.from(`${login}:${password}`).toString('base64');

async function testKeywordIdeas(keyword) {
    console.log(`\n=== Testing Keyword Ideas for: "${keyword}" ===\n`);

    const postData = [{
        keywords: [keyword],
        language_code: 'es',
        location_code: 2724, // Spain
        limit: 20,
        include_seed_keyword: false,
        include_serp_info: false
    }];

    console.log('Request:', JSON.stringify(postData, null, 2));

    const res = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    const data = await res.json();

    console.log('\n=== FULL RESPONSE ===');
    console.log('Status code:', data.status_code);
    console.log('Status message:', data.status_message);
    console.log('Cost:', data.cost);

    if (data.tasks?.[0]) {
        const task = data.tasks[0];
        console.log('\nTask status:', task.status_code, task.status_message);
        console.log('Task path:', task.path);

        if (task.result?.[0]) {
            const result = task.result[0];
            console.log('\nTotal count:', result.total_count);
            console.log('Items count:', result.items_count);

            if (result.items && result.items.length > 0) {
                console.log('\n=== SAMPLE ITEMS ===');
                result.items.slice(0, 5).forEach((item, i) => {
                    console.log(`\n${i + 1}. ${item.keyword}`);
                    console.log('   Volume:', item.keyword_info?.search_volume);
                    console.log('   Difficulty:', item.keyword_properties?.keyword_difficulty);
                    console.log('   Intent:', item.search_intent_info?.main_intent);
                });
            } else {
                console.log('\n!!! NO ITEMS FOUND !!!');
                console.log('Full result:', JSON.stringify(result, null, 2));
            }
        } else {
            console.log('\n!!! NO RESULT FOUND !!!');
            console.log('Full task:', JSON.stringify(task, null, 2));
        }
    } else {
        console.log('\n!!! NO TASKS !!!');
        console.log('Full data:', JSON.stringify(data, null, 2));
    }
}

// Test with a known keyword
testKeywordIdeas('hipoteca').catch(console.error);
