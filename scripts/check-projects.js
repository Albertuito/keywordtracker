const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProjects() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                keywords: {
                    take: 2
                }
            }
        });

        console.log('=== PROJECTS ===\n');

        for (const proj of projects) {
            console.log(`Project: ${proj.name}`);
            console.log(`  Domain: "${proj.domain}"`);
            console.log(`  Keywords: ${proj.keywords.length > 0 ? proj.keywords.map(k => k.term).join(', ') : 'None'}`);
            console.log('');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
    }
}

checkProjects();
