const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const coupon = await prisma.coupon.upsert({
            where: { code: 'JONYONLINECASH' },
            update: {},
            create: {
                code: 'JONYONLINECASH',
                amount: 1.00,
                maxUses: 10000, // High limit for the newsletter
                active: true,
                expiresAt: null
            }
        });
        console.log('Coupon created/verified:', coupon);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
