const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeDomain(url) {
    try {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    } catch {
        return url.toLowerCase();
    }
}

async function testDomainMatching() {
    const project = await prisma.project.findFirst({
        where: { domain: { contains: 'halcon' } }
    });

    if (!project) {
        console.log('❌ No se encontró el proyecto');
        return;
    }

    console.log('\n🏢 PROYECTO:');
    console.log(`   Dominio Original: "${project.domain}"`);
    console.log(`   Dominio Normalizado: "${normalizeDomain(project.domain)}"`);

    console.log('\n📊 DATOS DE DATAFORSEO:');
    const dataforseoDomain = "halconhipotecas.es";
    console.log(`   Dominio DataForSEO: "${dataforseoDomain}"`);
    console.log(`   Normalizado: "${normalizeDomain(dataforseoDomain)}"`);

    console.log('\n🔍 COMPARACIÓN:');
    const ourNormalized = normalizeDomain(project.domain);
    const theirNormalized = normalizeDomain(dataforseoDomain);

    console.log(`   ¿Son iguales? ${ourNormalized === theirNormalized ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Nuestro: "${ourNormalized}"`);
    console.log(`   De ellos: "${theirNormalized}"`);
}

testDomainMatching().catch(e => console.error(e)).finally(() => prisma.$disconnect());
