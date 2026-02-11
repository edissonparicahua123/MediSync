import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const mapping: Record<string, string> = {
        'Cardiology': 'Cardiología',
        'Neurology': 'Neurología',
        'Pediatrics': 'Pediatría',
        'Orthopedics': 'Ortopedia',
        'General Medicine': 'Medicina General',
        'Surgery': 'Cirugía',
        'Dermatology': 'Dermatología',
        'Emergency': 'Emergencias'
    };

    const specs = await prisma.specialty.findMany();

    for (const spec of specs) {
        if (mapping[spec.name]) {
            console.log(`Translating ${spec.name} to ${mapping[spec.name]}`);
            await prisma.specialty.update({
                where: { id: spec.id },
                data: { name: mapping[spec.name] }
            });
        }
    }

    console.log('✅ Specialties updated to Spanish');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
