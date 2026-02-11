import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking OrganizationConfig ---');
    try {
        const config = await prisma.organizationConfig.findFirst();
        if (config) {
            console.log('Found config:', config);
            // Ensure maintenanceMode is false to unlock the user
            await prisma.organizationConfig.update({
                where: { id: config.id },
                data: { maintenanceMode: false }
            });
            console.log('Successfully set maintenanceMode to false');
        } else {
            console.log('No config found. Creating one...');
            await prisma.organizationConfig.create({
                data: {
                    hospitalName: 'EdiCarex Hospital',
                    email: 'contact@edicarex.com',
                    phone: '+1 555 123 4567',
                    openingHours: {},
                    billing: {},
                    ai: {},
                    maintenanceMode: false
                }
            });
            console.log('Successfully created config');
        }
    } catch (error) {
        console.error('DATABASE ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
