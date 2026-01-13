const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({
        where: { email: 'infoinfolinfo@gmail.com' }
    });

    console.log('--- ADMIN USER ---');
    if (admin) {
        console.log(`ID: ${admin.id}`);
        console.log(`Email check: ${admin.email === 'infoinfolinfo@gmail.com' ? 'EXACT MATCH' : 'MISMATCH'}`);
        console.log(`Role: ${admin.role}`);
    } else {
        console.log('User "infoinfolinfo@gmail.com" NOT FOUND');
        // Buscar parecidos
        const allUsers = await prisma.user.findMany({
            where: { email: { contains: 'info' } },
            select: { email: true, role: true }
        });
        console.log('Similar users:', allUsers);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
