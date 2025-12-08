import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'System administrator with full access',
            isSystem: true,
        },
    });

    const doctorRole = await prisma.role.upsert({
        where: { name: 'Doctor' },
        update: {},
        create: {
            name: 'Doctor',
            description: 'Medical doctor',
            isSystem: true,
        },
    });

    const nurseRole = await prisma.role.upsert({
        where: { name: 'Nurse' },
        update: {},
        create: {
            name: 'Nurse',
            description: 'Nursing staff',
            isSystem: true,
        },
    });

    console.log('✅ Roles created');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@medisync.com' },
        update: {},
        create: {
            email: 'admin@medisync.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1234567890',
            roleId: adminRole.id,
            isActive: true,
        },
    });

    console.log('✅ Admin user created');

    // Create Specialties
    const specialties = [
        { name: 'Cardiology', description: 'Heart and cardiovascular system' },
        { name: 'Neurology', description: 'Brain and nervous system' },
        { name: 'Pediatrics', description: 'Children and infants' },
        { name: 'Orthopedics', description: 'Bones and joints' },
        { name: 'General Medicine', description: 'General medical care' },
    ];

    for (const specialty of specialties) {
        await prisma.specialty.upsert({
            where: { name: specialty.name },
            update: {},
            create: specialty,
        });
    }

    console.log('✅ Specialties created');

    // Create Sample Patients
    const patients = [
        {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'MALE',
            bloodType: 'A+',
            phone: '+1234567891',
            email: 'john.doe@example.com',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: new Date('1985-08-22'),
            gender: 'FEMALE',
            bloodType: 'O+',
            phone: '+1234567892',
            email: 'jane.smith@example.com',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
        },
    ];

    for (const patient of patients) {
        await prisma.patient.create({ data: patient });
    }

    console.log('✅ Sample patients created');

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
