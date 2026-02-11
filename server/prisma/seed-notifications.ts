import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding notifications...');

    // 1. Get the first user (usually the admin or the logged-in user)
    const user = await prisma.user.findFirst();

    if (!user) {
        console.error('❌ No users found. Please create a user first.');
        return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // 2. Create sample notifications
    const notifications = [
        {
            userId: user.id,
            title: '¡Bienvenido a EdiCarex!',
            message: 'Gracias por usar nuestra plataforma. Aquí recibirás todas tus alertas importantes.',
            type: 'SYSTEM_ALERT',
            isRead: false,
            relatedEntityType: 'SYSTEM',
        },
        {
            userId: user.id,
            title: 'Recordatorio de Reunión',
            message: 'Tienes una reunión de equipo programada para mañana a las 9:00 AM.',
            type: 'APPOINTMENT_REMINDER',
            isRead: false,
            relatedEntityType: 'AGENDAMIENTO',
        },
        {
            userId: user.id,
            title: 'Resultados de Laboratorio Disponibles',
            message: 'Los resultados del paciente Juan Pérez ya están listos para revisión.',
            type: 'LAB_RESULT',
            isRead: true, // Marked as read to show variety
            relatedEntityType: 'LABORATORIO',
        },
        {
            userId: user.id,
            title: 'Factura Pendiente',
            message: 'Hay una factura pendiente de aprobación #INV-2024-001',
            type: 'BILLING',
            isRead: false,
            relatedEntityType: 'FACTURACION',
        }
    ];

    for (const notif of notifications) {
        await prisma.notification.create({
            data: notif,
        });
        console.log(`✅ Created notification: ${notif.title}`);
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
