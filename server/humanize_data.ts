import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REAL_PATIENT_NAMES = [
    'Carlos Rodríguez',
    'Ana García',
    'Luis Morales',
    'María Torres',
    'Jorge Herrera',
    'Sofía Castro',
    'Pedro Rojas',
    'Valentina Mendoza',
    'Miguel Silva',
    'Elena Vargas'
];

const REAL_DOCTORS = [
    'Dr. Juan Pérez',
    'Dra. Laura Gómez',
    'Dr. Ricardo Fernández',
    'Dra. Carmen Lima',
    'Dr. Eduardo Salas'
];

const REAL_DIAGNOSES = [
    'Síndrome Coronario Agudo',
    'Fractura de Tibia',
    'Crisis Hipertensiva',
    'Apendicitis Aguda',
    'Neumonía Adquirida',
    'Traumatismo Craneoencefálico',
    'Insuficiencia Respiratoria',
    'Cólico Renal'
];

async function main() {
    console.log('✨ Humanizing Emergency Data...');

    const cases = await prisma.emergencyCase.findMany();
    console.log(`Found ${cases.length} cases to update.`);

    for (let i = 0; i < cases.length; i++) {
        const kase = cases[i];

        // Pick random realistic data
        const patientName = REAL_PATIENT_NAMES[i % REAL_PATIENT_NAMES.length];
        const doctorName = REAL_DOCTORS[i % REAL_DOCTORS.length];
        const diagnosis = REAL_DIAGNOSES[i % REAL_DIAGNOSES.length];

        // Variation in age
        const age = 20 + Math.floor(Math.random() * 60);

        console.log(`Updating Case ${kase.id}: ${patientName} handled by ${doctorName}`);

        await prisma.emergencyCase.update({
            where: { id: kase.id },
            data: {
                patientName: patientName,
                patientAge: age,
                doctorName: doctorName,
                diagnosis: diagnosis,
                // Also update chief complaint to match diagnosis loosely
                chiefComplaint: `Paciente presenta ${diagnosis.toLowerCase()}`
            }
        });
    }

    console.log('✅ Data humanization complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
