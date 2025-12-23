import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REAL_MEDS = [
    { name: 'Paracetamol', strength: '500mg', type: 'Medicamento', lab: 'Bayer', stock: 150 },
    { name: 'Amoxicilina', strength: '500mg', type: 'Medicamento', lab: 'Pfizer', stock: 85 },
    { name: 'Ibuprofeno', strength: '400mg', type: 'Medicamento', lab: 'Genfar', stock: 200 },
    { name: 'Omeprazol', strength: '20mg', type: 'Medicamento', lab: 'MK', stock: 120 },
    { name: 'Losartán', strength: '50mg', type: 'Medicamento', lab: 'Normon', stock: 300 },
    { name: 'Jeringa', strength: '5ml', type: 'Suministro', lab: 'Nipro', stock: 1000 },
    { name: 'Guantes Quirúrgicos', strength: 'M', type: 'Suministro', lab: 'Ambu', stock: 500 }
];

async function main() {
    console.log('💊 Populating Pharmacy Data...');

    // 1. Get reference data
    const doctor = await prisma.doctor.findFirst();
    const patient = await prisma.patient.findFirst();

    if (!doctor || !patient) {
        console.log('❌ Need at least 1 Doctor and 1 Patient to seed orders.');
        return;
    }

    // 2. Create Medications & Stock
    for (const med of REAL_MEDS) {
        // Check if exists
        let medication = await prisma.medication.findFirst({ where: { name: med.name } });

        if (!medication) {
            medication = await prisma.medication.create({
                data: {
                    name: `${med.name} ${med.strength}`,
                    category: med.type,
                    manufacturer: med.lab,
                    description: `Tratamiento genérico de ${med.name}`,
                    dosageForm: med.type === 'Suministro' ? 'Unidad' : 'Tableta'
                }
            });
            console.log(`Created Med: ${medication.name}`);

            // Create Stock
            await prisma.pharmacyStock.create({
                data: {
                    medicationId: medication.id,
                    quantity: med.stock,
                    minStockLevel: 50,
                    batchNumber: `LOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    unitPrice: 0.50,
                    sellingPrice: 1.50
                }
            });

            // Create Kardex (Initial Entry)
            await prisma.pharmacyMovement.create({
                data: {
                    medicationId: medication.id,
                    movementType: 'IN', // Matches 'ENTRADA' concept
                    quantity: med.stock,
                    // remainingStock removed as it is not in schema
                    reason: 'Inventario Inicial',
                    performedBy: 'Sistema'
                }
            });
        }
    }

    // 3. Create Dummy Orders
    const allMeds = await prisma.medication.findMany();

    // Create 3 pending orders
    for (let i = 0; i < 3; i++) {
        const randomMed = allMeds[Math.floor(Math.random() * allMeds.length)];
        await (prisma as any).pharmacyOrder.create({
            data: {
                orderNumber: `ORD-${Date.now()}-${i}`,
                medicationId: randomMed.id,
                doctorId: doctor.id,
                patientId: patient.id,
                quantity: Math.floor(Math.random() * 10) + 1,
                status: Math.random() > 0.5 ? 'PENDING' : 'APPROVED',
                requestedAt: new Date(),
                approvedAt: new Date()
            }
        });
    }

    console.log('✅ Pharmacy populated with real-looking data.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
