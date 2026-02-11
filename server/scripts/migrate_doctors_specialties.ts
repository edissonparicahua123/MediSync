import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Doctor Specialty Migration...');

    // 1. Get all specialties to have a map
    const specialties = await prisma.specialty.findMany();
    const specialtyMap: Record<string, string> = {};
    specialties.forEach(s => {
        specialtyMap[s.name.toLowerCase()] = s.id;
    });

    // 2. Get all doctors
    const doctors = await prisma.doctor.findMany({
        where: { specialtyId: null }
    });

    console.log(`Found ${doctors.length} doctors without specialtyId.`);

    for (const doc of doctors) {
        const specName = doc.specialization?.toLowerCase() || '';

        // Try to match the name
        let targetId = specialtyMap[specName];

        // Fallback: If "Emergencias" vs "Emergency" etc, but user synced to Spanish
        // If no match found, we could default to "Medicina General" or skip
        if (!targetId) {
            console.log(`⚠️ No exact match for specialty: "${doc.specialization}". Skipping or manual fix needed.`);
            continue;
        }

        console.log(`✅ Mapping doctor ${doc.licenseNumber} (${doc.specialization}) -> specialtyId ${targetId}`);
        await prisma.doctor.update({
            where: { id: doc.id },
            data: { specialtyId: targetId }
        });
    }

    console.log('🎉 Migration completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
