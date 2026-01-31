
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const beds = await prisma.bed.findMany({
        include: { patient: true }
    });
    console.log(JSON.stringify(beds, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
