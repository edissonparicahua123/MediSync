import { PrismaClient } from './node_modules/.prisma/client/index';
// @ts-ignore

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Emergency Case Bed Numbers...');

    // 1. Get all cases with "Unknown" bed number
    const cases = await prisma.emergencyCase.findMany({
        where: { bedNumber: 'Unknown' }
    });

    console.log(`Found ${cases.length} cases with Unknown bed number.`);

    if (cases.length === 0) return;

    // 2. Get available "OCCUPIED" beds
    // In a real scenario, we'd match usage more carefully, 
    // but here we just want to assign valid strings for display.
    const beds = await prisma.bed.findMany({
        orderBy: { number: 'asc' }
    });

    console.log(`Found ${beds.length} total beds.`);

    // 3. Update each case with a bed number
    for (let i = 0; i < cases.length; i++) {
        const kase = cases[i];
        // Cycle through beds if there are more cases than beds (unlikely in this seed)
        const bed = beds[i % beds.length];

        console.log(`Assigning Bed ${bed.number} to Case ${kase.id}`);

        await prisma.emergencyCase.update({
            where: { id: kase.id },
            data: { bedNumber: bed.number }
        });
    }

    console.log('✅ Bed numbers updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
