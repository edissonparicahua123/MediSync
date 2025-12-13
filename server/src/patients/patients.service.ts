import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientsDto } from './dto';

@Injectable()
export class PatientsService {
    constructor(private prisma: PrismaService) { }

    async create(createPatientDto: CreatePatientDto) {
        try {
            return await this.prisma.patient.create({
                data: createPatientDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
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

        try {
            return await this.prisma.patient.update({
                where: { id },
                data: updatePatientDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error.code === 'P2002') {
            const fields = error.meta?.target ? ` en: ${error.meta.target.join(', ')}` : '';
            throw new ConflictException(`Ya existe un paciente con este dato único${fields}.`);
        }
        console.error('Prisma Error:', error);
        throw new BadRequestException('Error al procesar datos del paciente. Verifique los campos enviados.');
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
                doctor: { include: { user: true } },
            },
        });
    }
}
