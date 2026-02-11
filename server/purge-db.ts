import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- PURGING ALL CONFIGS ---');
    const del = await prisma.organizationConfig.deleteMany();
    console.log('Deleted records:', del.count);

    console.log('Creating fresh config...');
    await prisma.organizationConfig.create({
        data: {
            hospitalName: 'MediSync Health',
            email: 'admin@medisync.com',
            phone: '+1 234 567 890',
            openingHours: {},
            billing: {},
            ai: {},
            maintenanceMode: false
        }
    });
    console.log('DONE.');
}
main().finally(() => prisma.$disconnect());
