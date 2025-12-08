import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientsDto } from './dto';

@Injectable()
export class PatientsService {
    constructor(private prisma: PrismaService) { }

    async create(createPatientDto: CreatePatientDto) {
        return this.prisma.patient.create({
            data: createPatientDto,
        });
    }

    async findAll(page: number = 1, limit: number = 20, search?: SearchPatientsDto) {
        const skip = (page - 1) * limit;
        const where: any = { deletedAt: null };

        if (search?.query) {
            where.OR = [
                { firstName: { contains: search.query, mode: 'insensitive' } },
                { lastName: { contains: search.query, mode: 'insensitive' } },
                { phone: { contains: search.query } },
                { email: { contains: search.query, mode: 'insensitive' } },
            ];
        }

        if (search?.gender) {
            where.gender = search.gender;
        }

        if (search?.status) {
            where.status = search.status;
        }

        const [patients, total] = await Promise.all([
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            appointments: true,
                            medicalRecords: true,
                        },
                    },
                },
            }),
            this.prisma.patient.count({ where }),
        ]);

        return {
            data: patients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: {
                appointments: {
                    take: 10,
                    orderBy: { appointmentDate: 'desc' },
                    include: { doctor: { include: { user: true } } },
                },
                medicalRecords: {
                    take: 10,
                    orderBy: { visitDate: 'desc' },
                    include: { doctor: { include: { user: true } } },
                },
                labOrders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                files: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!patient || patient.deletedAt) {
            throw new NotFoundException('Patient not found');
        }

        return patient;
    }

    async update(id: string, updatePatientDto: UpdatePatientDto) {
        await this.findOne(id);

        return this.prisma.patient.update({
            where: { id },
            data: updatePatientDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async getMedicalHistory(id: string) {
        await this.findOne(id);

        return this.prisma.medicalRecord.findMany({
            where: { patientId: id },
            orderBy: { visitDate: 'desc' },
            include: {
                doctor: { include: { user: true, specialty: true } },
            },
        });
    }
}
