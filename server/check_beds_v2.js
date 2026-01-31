
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- BUSCANDO TODAS LAS CAMAS ---');
    const beds = await prisma.bed.findMany({
        include: { patient: true }
    });

    beds.forEach(bed => {
        console.log(`Cama: ${bed.number} (${bed.status})`);
        if (bed.status === 'OCCUPIED') {
            console.log(`  Paciente: ${bed.patient ? bed.patient.firstName + ' ' + bed.patient.lastName : 'N/A'}`);
            console.log(`  Diagnóstico: ${bed.diagnosis}`);
            console.log(`  Especialidad: ${bed.specialty}`);
            console.log(`  Alta Estimada: ${bed.estimatedDischarge}`);
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
