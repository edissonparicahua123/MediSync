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
}
