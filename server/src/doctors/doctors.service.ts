import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [doctors, total] = await Promise.all([
            this.prisma.doctor.findMany({
                where: { deletedAt: null },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true } },
                    specialty: true,
                    schedules: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.doctor.count({ where: { deletedAt: null } }),
        ]);

        return {
            data: doctors,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id },
            include: {
                user: true,
                specialty: true,
                schedules: true,
                appointments: {
                    take: 20,
                    orderBy: { appointmentDate: 'desc' },
                    include: { patient: true },
                },
            },
        });

        if (!doctor || doctor.deletedAt) {
            throw new NotFoundException('Doctor not found');
        }

        return doctor;
    }

    async create(data: any) {
        const { firstName, lastName, email, phone, password, ...doctorData } = data;

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Check if already a doctor
            const existingDoctor = await this.prisma.doctor.findUnique({
                where: { userId: existingUser.id },
            });
            if (existingDoctor) {
                throw new Error('User is already a doctor');
            }

            // Create doctor profile for existing user
            return this.prisma.doctor.create({
                data: {
                    userId: existingUser.id,
                    ...doctorData,
                },
                include: { user: true, specialty: true },
            });
        }

        // Create new user and doctor in transaction
        return this.prisma.$transaction(async (prisma) => {
            // 1. Get Doctor Role
            let doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } });
            if (!doctorRole) {
                // Fallback or create if not exists
                doctorRole = await prisma.role.findFirst();
            }

            // 2. Create User
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    password: password || 'Medisync2024!', // Default password
                    roleId: doctorRole.id!,
                },
            });

            // 3. Create Doctor Profile
            return prisma.doctor.create({
                data: {
                    userId: user.id,
                    ...doctorData,
                },
                include: { user: true, specialty: true },
            });
        });
    }

    async update(id: string, data: any) {
        const { firstName, lastName, email, phone, ...doctorData } = data;

        // Update doctor and related user info
        const doctor = await this.prisma.doctor.findUnique({ where: { id } });
        if (!doctor) throw new NotFoundException('Doctor not found');

        return this.prisma.$transaction(async (prisma) => {
            // Update User if needed
            if (firstName || lastName || email || phone) {
                await prisma.user.update({
                    where: { id: doctor.userId },
                    data: { firstName, lastName, email, phone },
                });
            }

            // Update Doctor
            return prisma.doctor.update({
                where: { id },
                data: doctorData,
                include: { user: true, specialty: true },
            });
        });
    }

    async remove(id: string) {
        return this.prisma.doctor.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
