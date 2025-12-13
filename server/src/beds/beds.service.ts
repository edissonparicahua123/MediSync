import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BedsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        // Check if number exists
        const existing = await this.prisma.bed.findUnique({ where: { number: data.number } });
        if (existing) throw new BadRequestException('Bed number already exists');

        return this.prisma.bed.create({
            data: {
                number: data.number,
                ward: data.ward,
                type: data.type,
                status: 'AVAILABLE',
                notes: data.notes,
            },
        });
    }

    async findAll(query: any) {
        const where: any = {};
        if (query.ward && query.ward !== 'ALL') where.ward = query.ward;
        if (query.status && query.status !== 'ALL') where.status = query.status;

        const beds = await this.prisma.bed.findMany({
            where,
            include: {
                patient: true,
            },
            orderBy: { number: 'asc' },
        });

        return { data: beds };
    }

    async findOne(id: string) {
        const bed = await this.prisma.bed.findUnique({
            where: { id },
            include: {
                patient: true,
                activities: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                },
            },
        });
        if (!bed) throw new NotFoundException('Bed not found');
        return bed;
    }

    async update(id: string, data: any) {
        return this.prisma.bed.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.bed.delete({ where: { id } });
    }

    async assignPatient(id: string, data: { patientId: string }) {
        const bed = await this.prisma.bed.findUnique({ where: { id } });
        if (!bed) throw new NotFoundException('Bed not found');
        if (bed.status === 'OCCUPIED' && bed.patientId) throw new BadRequestException('Bed already occupied');

        // Update bed
        const updated = await this.prisma.bed.update({
            where: { id },
            data: {
                status: 'OCCUPIED',
                patientId: data.patientId,
                admissionDate: new Date(),
            },
            include: { patient: true },
        });

        // Log activity
        await this.prisma.bedActivity.create({
            data: {
                bedId: id,
                action: 'ASIGNACION',
                details: `Paciente asignado: ${updated.patient?.firstName} ${updated.patient?.lastName}`,
            },
        });

        return updated;
    }

    async dischargePatient(id: string) {
        const bed = await this.prisma.bed.findUnique({ where: { id }, include: { patient: true } });
        if (!bed) throw new NotFoundException('Bed not found');

        const patientName = bed.patient ? `${bed.patient.firstName} ${bed.patient.lastName}` : 'Unknown';

        // Update bed to CLEANING status, clear patient
        const updated = await this.prisma.bed.update({
            where: { id },
            data: {
                status: 'CLEANING',
                patientId: null,
                admissionDate: null,
            },
        });

        // Log activity
        await this.prisma.bedActivity.create({
            data: {
                bedId: id,
                action: 'ALTA',
                details: `Paciente dado de alta: ${patientName}`,
            },
        });

        return updated;
    }

    async getStats() {
        const [total, available, occupied, cleaning, maintenance, reserved] = await Promise.all([
            this.prisma.bed.count(),
            this.prisma.bed.count({ where: { status: 'AVAILABLE' } }),
            this.prisma.bed.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.bed.count({ where: { status: 'CLEANING' } }),
            this.prisma.bed.count({ where: { status: 'MAINTENANCE' } }),
            this.prisma.bed.count({ where: { status: 'RESERVED' } }),
        ]);

        return {
            total,
            available,
            occupied,
            cleaning,
            maintenance,
            reserved,
            occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
        };
    }
}
