import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const invId = '6fdf569d-8000-444b-a265-f90b0ead3992';
    const inv = await prisma.invoice.findUnique({ where: { id: invId } });
    if (!inv) {
        console.log('Invoice not found');
        return;
    }
    console.log(`Invoice Date: ${inv.invoiceDate.toISOString()}`);
    console.log(`Current Time: ${new Date().toISOString()}`);

    // Check if it matches '12months' filter
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    console.log(`One year ago: ${oneYearAgo.toISOString()}`);
    console.log(`Is in range? ${inv.invoiceDate >= oneYearAgo}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
