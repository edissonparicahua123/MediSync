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
                    user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, address: true } },
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
                appointments: {
                    take: 20,
                    orderBy: { appointmentDate: 'desc' },
                    include: { patient: true },
                },
                schedules: true,
            },
        });

        if (!doctor || doctor.deletedAt) {
            throw new NotFoundException('Doctor not found');
        }

        return doctor;
    }

    async create(data: any) {
        const { firstName, lastName, email, phone, address, avatar, password, schedules, ...doctorData } = data;

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
                    schedules: schedules && schedules.length > 0 ? {
                        create: schedules.map((s: any) => ({
                            dayOfWeek: Number(s.dayOfWeek),
                            startTime: s.startTime,
                            endTime: s.endTime,
                            isActive: true
                        }))
                    } : undefined
                },
                include: { user: true, specialty: true, schedules: true },
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
                    address,
                    avatar,
                    password: password || 'Medisync2024!', // Default password
                    roleId: doctorRole?.id || '',
                },
            });

            // 3. Create Doctor Profile
            return prisma.doctor.create({
                data: {
                    userId: user.id,
                    ...doctorData,
                    schedules: schedules && schedules.length > 0 ? {
                        create: schedules.map((s: any) => ({
                            dayOfWeek: Number(s.dayOfWeek),
                            startTime: s.startTime,
                            endTime: s.endTime,
                            isActive: true
                        }))
                    } : undefined
                },
                include: { user: true, specialty: true, schedules: true },
            });
        });
    }

    async update(id: string, data: any) {
        const { firstName, lastName, email, phone, address, avatar, schedules, ...doctorData } = data;

        // Update doctor and related user info
        const doctor = await this.prisma.doctor.findUnique({ where: { id } });
        if (!doctor) throw new NotFoundException('Doctor not found');

        return this.prisma.$transaction(async (prisma) => {
            // Update User if needed
            if (firstName || lastName || email || phone || address || avatar !== undefined) {
                await prisma.user.update({
                    where: { id: doctor.userId },
                    data: { firstName, lastName, email, phone, address, avatar },
                });
            }

            // Update Schedules if provided
            if (schedules && Array.isArray(schedules)) {
                // Delete existing schedules
                await prisma.doctorSchedule.deleteMany({
                    where: { doctorId: id },
                });

                // Create new schedules
                if (schedules.length > 0) {
                    await prisma.doctorSchedule.createMany({
                        data: schedules.map((schedule: any) => ({
                            doctorId: id,
                            dayOfWeek: Number(schedule.dayOfWeek),
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                            isActive: true,
                        })),
                    });
                }
            }

            // Update Doctor
            return prisma.doctor.update({
                where: { id },
                data: doctorData, // specialization, yearsExperience, consultationFee, isAvailable, bio
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

    async addDocument(id: string, data: any) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id } });
        if (!doctor) throw new NotFoundException('Doctor not found');

        return this.prisma.doctorDocument.create({
            data: {
                doctorId: id,
                title: data.title,
                type: data.type || 'Document',
                url: data.url,
                size: data.size || 0,
            },
        });
    }

    async getDocuments(id: string) {
        return this.prisma.doctorDocument.findMany({
            where: { doctorId: id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async removeDocument(doctorId: string, docId: string) {
        return this.prisma.doctorDocument.deleteMany({
            where: {
                id: docId,
                doctorId: doctorId,
            },
        });
    }
}
