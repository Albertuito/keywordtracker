const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        // Get latest keywords with positions
        const keywords = await prisma.keyword.findMany({
            include: {
                positions: {
                    orderBy: { date: 'desc' },
                    take: 3
                },
                project: {
                    select: { name: true, domain: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log('=== KEYWORDS IN DATABASE ===\n');

        for (const kw of keywords) {
            console.log(`Keyword: "${kw.term}" (Project: ${kw.project.name})`);
            console.log(`  Task ID: ${kw.dataforseoTaskId || 'None'}`);
            console.log(`  Positions count: ${kw.positions.length}`);

            if (kw.positions.length > 0) {
                kw.positions.forEach((pos, i) => {
                    console.log(`    [${i}] Position: ${pos.position}, Date: ${pos.date.toISOString()}`);
                });
            } else {
                console.log(`    NO POSITIONS SAVED`);
            }
            console.log('');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

checkData();
