import { PrismaClient } from '../node_modules/.prisma/client/index';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Standardizing Specialties...');

    const specialties = [
        { name: 'Cardiología', description: 'Corazón y sistema cardiovascular' },
        { name: 'Neurología', description: 'Cerebro y sistema nervioso' },
        { name: 'Pediatría', description: 'Niños e infantes' },
        { name: 'Ortopedia', description: 'Huesos y articulaciones' },
        { name: 'Medicina General', description: 'Atención médica general' },
        { name: 'Cirugía', description: 'Procedimientos quirúrgicos' },
        { name: 'Dermatología', description: 'Piel y dermatología' },
        { name: 'Emergencias', description: 'Atención de urgencias' },
        { name: 'Ginecología', description: 'Salud reproductiva femenina' },
        { name: 'Oftalmología', description: 'Visión y ojos' },
        { name: 'Odontología', description: 'Salud dental' },
        { name: 'Psicología', description: 'Salud mental' },
    ];

    for (const spec of specialties) {
        await prisma.specialty.upsert({
            where: { name: spec.name },
            update: { description: spec.description },
            create: spec,
        });
    }

    console.log('✅ Specialties synchronized successfully');
}

main()
    .catch((e) => {
        console.error('❌ Error synchronizing specialties:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
