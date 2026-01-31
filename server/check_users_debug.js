const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt'); // Ensure bcrypt is available

async function main() {
    console.log('--- PASSWORD RESET TOOL ---');
    try {
        // Find user by name part
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firstName: { contains: 'Edisson', mode: 'insensitive' } },
                    { lastName: { contains: 'Paricahua', mode: 'insensitive' } }
                ],
                patient: { isNot: null } // Only patients
            }
        });

        if (!user) {
            console.log('User Edisson/Paricahua NOT FOUND in patient users.');
            return;
        }

        console.log(`FOUND USER: ${user.email} (${user.firstName} ${user.lastName})`);

        // Reset Password
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        console.log('SUCCESS: Password reset to 123456');

    } catch (error) {
        console.error('Error:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
