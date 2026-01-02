const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestKeyword() {
    try {
        // Get the Hipopoteca project
        const project = await prisma.project.findFirst({
            where: { name: 'Hipopoteca' }
        });

        if (!project) {
            console.log('Project not found');
            return;
        }

        // Add a test keyword
        const keyword = await prisma.keyword.create({
            data: {
                term: 'hipoteca test debug',
                country: 'es',
                device: 'desktop',
                projectId: project.id
            }
        });

        console.log(`Created keyword: ${keyword.term} (ID: ${keyword.id})`);
        console.log(`Now run: POST http://localhost:3013/api/cron with body: {"action":"queue","projectId":"${project.id}","keywordIds":["${keyword.id}"]}`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
    }
}

addTestKeyword();
