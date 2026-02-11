
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        console.log('Checking for admin user...');
        const user = await prisma.user.findUnique({
            where: { email: 'admin@edicarex.com' },
            include: { role: true }
        });

        if (user) {
            console.log('✅ User found:', user.email);
            console.log('Role:', user.role);

            const isMatch = await bcrypt.compare('password123', user.password);
            console.log('Password match (password123):', isMatch ? '✅ YES' : '❌ NO');
        } else {
            console.log('❌ User admin@edicarex.com NOT FOUND');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
