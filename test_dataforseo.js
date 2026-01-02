// Find money object in response
require('dotenv').config();

async function testBalance() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    const result = data.tasks?.[0]?.result?.[0];

    if (result) {
        // Log just top-level keys
        console.log('Top-level keys in result:', Object.keys(result));

        // Check for money
        if (result.money) {
            console.log('Money object:', result.money);
        } else {
            console.log('No money field.');
            // Check for balance anywhere
            const str = JSON.stringify(result);
            if (str.includes('balance')) {
                console.log('balance found somewhere in response');
            }
            if (str.includes('money')) {
                console.log('money found somewhere in response');
            }
        }
    }
}

testBalance();
