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

    // ============================================
    // HR SEEDING
    // ============================================
    const employees = [
        {
            name: 'Dr. John Smith',
            area: 'Cardiología',
            role: 'Doctor',
            department: 'Medical',
            email: 'john.smith@medisync.com',
            salary: 8500,
            contract: 'Tiempo Completo',
            status: 'ACTIVE',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            hireDate: new Date('2020-01-15'),
            shifts: [
                { dayOfWeek: 'Lunes', shiftType: 'MORNING', startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 'Martes', shiftType: 'MORNING', startTime: '08:00', endTime: '16:00' },
            ]
        },
        {
            name: 'Dra. Sarah Johnson',
            area: 'Pediatría',
            role: 'Doctor',
            department: 'Medical',
            email: 'sarah.johnson@medisync.com',
            salary: 7800,
            contract: 'Tiempo Completo',
            status: 'ACTIVE',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            hireDate: new Date('2021-03-10'),
            shifts: [
                { dayOfWeek: 'Lunes', shiftType: 'AFTERNOON', startTime: '14:00', endTime: '22:00' },
                { dayOfWeek: 'Miércoles', shiftType: 'MORNING', startTime: '08:00', endTime: '16:00' },
            ]
        },
        {
            name: 'Enf. Mike Williams',
            area: 'Emergencia',
            role: 'Nurse',
            department: 'Emergency',
            email: 'mike.williams@medisync.com',
            salary: 4500,
            contract: 'Tiempo Completo',
            status: 'ACTIVE',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            hireDate: new Date('2022-06-01'),
            shifts: [
                { dayOfWeek: 'Lunes', shiftType: 'NIGHT', startTime: '22:00', endTime: '06:00' },
            ]
        },
        {
            name: 'Emma Brown',
            area: 'Administración',
            role: 'Admin',
            department: 'Administrative',
            email: 'emma.brown@medisync.com',
            salary: 3200,
            contract: 'Medio Tiempo',
            status: 'ACTIVE',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            hireDate: new Date('2023-01-20'),
            shifts: []
        }
    ];

    for (const emp of employees) {
        const { shifts, ...empData } = emp;
        const employee = await prisma.employee.create({ data: empData });

        // Create Payroll
        // Create Payroll
        // Schema: baseSalary, bonuses, deductions, netSalary
        const pension = Number(emp.salary) * 0.13;
        const health = Number(emp.salary) * 0.10;
        const deductions = pension + health + Math.floor(Math.random() * 100);
        const bonuses = Math.floor(Math.random() * 500);

        await prisma.payroll.create({
            data: {
                employeeId: employee.id,
                periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                baseSalary: emp.salary,
                bonuses: bonuses,
                deductions: deductions,
                netSalary: Number(emp.salary) + bonuses - deductions,
                status: 'DRAFT'
            }
        });

        // Create Shifts
        // Schema: startTime, endTime (DateTime), type (String)
        const today = new Date();

        for (const shift of shifts) {
            // Simple logic: create shift for the next occurrence of this day
            // For seed purposes, just using today + minimal offset to simulate valid dates
            const [startHour, startMin] = shift.startTime.split(':').map(Number);
            const [endHour, endMin] = shift.endTime.split(':').map(Number);

            const start = new Date(today);
            start.setHours(startHour, startMin, 0);

            const end = new Date(today);
            end.setHours(endHour, endMin, 0);

            // Adjust end date if it crosses midnight
            if (end < start) {
                end.setDate(end.getDate() + 1);
            }

            await prisma.employeeShift.create({
                data: {
                    employeeId: employee.id,
                    type: shift.shiftType,
                    status: 'SCHEDULED',
                    startTime: start,
                    endTime: end,
                }
            });
        }

        // Create Attendance (Random)
        if (Math.random() > 0.2) {
            await prisma.attendance.create({
                data: {
                    employeeId: employee.id,
                    checkIn: new Date(new Date().setHours(8, Math.floor(Math.random() * 15), 0)),
                    checkOut: new Date(new Date().setHours(17, 0, 0)),
                    hoursWorked: 9,
                    tardiness: Math.random() > 0.8 ? 15 : 0,
                    status: Math.random() > 0.8 ? 'LATE' : 'PRESENT'
                }
            });
        }
    }
    console.log('✅ HR Data (Employees, Payroll, Shifts) seeded');

    // ============================================
    // EMERGENCY SEEDING
    // ============================================
    const bedWards = [
        { ward: 'UCI', count: 5 },
        { ward: 'Emergencia', count: 10 },
        { ward: 'General', count: 10 }
    ];

    let bedCounter = 1;
    const allBedIds: string[] = [];

    for (const group of bedWards) {
        for (let i = 1; i <= group.count; i++) {
            const bed = await prisma.bedStatus.create({
                data: {
                    bedNumber: `${group.ward === 'UCI' ? 'UCI' : group.ward === 'Emergencia' ? 'ER' : 'GEN'}-${i.toString().padStart(2, '0')}`,
                    ward: group.ward,
                    status: Math.random() > 0.7 ? 'OCCUPIED' : 'AVAILABLE',
                    floor: 1
                }
            });
            if (bed.status === 'OCCUPIED') {
                allBedIds.push(bed.id);
            }
        }
    }

    // Create Emergency Cases for Occupied Beds
    const erDiagnoses = ['Dolor Torácico', 'Cefalea Intensa', 'Esguince Tobillo', 'Dificultad Respiratoria', 'Fiebre Alta'];

    for (const bedId of allBedIds) {
        const diagnosis = erDiagnoses[Math.floor(Math.random() * erDiagnoses.length)];
        const triage = Math.floor(Math.random() * 3) + 1; // 1-3 priority

        const kase = await prisma.emergencyCase.create({
            data: {
                patientName: `Paciente ${Math.floor(Math.random() * 1000)}`,
                patientAge: Math.floor(Math.random() * 60) + 18,
                triageLevel: triage,
                chiefComplaint: diagnosis,
                diagnosis: diagnosis,
                vitalSigns: { hr: 80 + Math.random() * 20, bp: '120/80', temp: 37 + Math.random(), spo2: 95 + Math.random() * 4 },
                status: 'ADMITTED',
                bedNumber: 'Unknown', // Ideally link to bed
                doctorName: 'Dr. Smith',
                admissionDate: new Date()
            }
        });

        // Update bed with patient info (conceptual link)
        await prisma.bedStatus.update({
            where: { id: bedId },
            data: { notes: `Occupied by Case ${kase.id}` }
        });
    }

    console.log('✅ Emergency Data (Beds, Cases) seeded');

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
