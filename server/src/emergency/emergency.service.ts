import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBedDto, UpdateBedStatusDto } from './dto';

@Injectable()
export class EmergencyService {
    constructor(private prisma: PrismaService) { }

    async getDashboard() {
        const [criticalPatients, totalBeds, availableBeds, occupiedBeds, bedsByWard] = await Promise.all([
            this.prisma.appointment.count({
                where: {
                    priority: 'URGENT',
                    status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
                },
            }),
            this.prisma.bedStatus.count(),
            this.prisma.bedStatus.count({ where: { status: 'AVAILABLE' } }),
            this.prisma.bedStatus.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.bedStatus.groupBy({
                by: ['ward', 'status'],
                _count: true,
            }),
        ]);

        return {
            criticalPatients,
            beds: {
                total: totalBeds,
                available: availableBeds,
                occupied: occupiedBeds,
                maintenance: totalBeds - availableBeds - occupiedBeds,
            },
            bedsByWard,
        };
    }

    async getCriticalPatients() {
        return this.prisma.appointment.findMany({
            where: {
                priority: 'URGENT',
                status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            include: {
                patient: true,
                doctor: {
                    include: {
                        user: true,
                        specialty: true,
                    },
                },
            },
            orderBy: { triageScore: 'desc' },
        });
    }

    async createBed(data: CreateBedDto) {
        return this.prisma.bedStatus.create({
            data,
        });
    }

    async getAllBeds(ward?: string) {
        const where: any = {};
        if (ward) where.ward = ward;

        return this.prisma.bedStatus.findMany({
            where,
            include: {
                patient: true,
            },
            orderBy: [{ ward: 'asc' }, { bedNumber: 'asc' }],
        });
    }

    async getBedById(id: string) {
        return this.prisma.bedStatus.findUnique({
            where: { id },
            include: {
                patient: true,
            },
        });
    }

    async updateBedStatus(id: string, data: UpdateBedStatusDto) {
        const updateData: any = { ...data };

        if (data.patientId) {
            updateData.assignedAt = new Date();
        } else if (data.status === 'AVAILABLE') {
            updateData.patientId = null;
            updateData.assignedAt = null;
        }

        return this.prisma.bedStatus.update({
            where: { id },
            data: updateData,
        });
    }

    async getWardStats() {
        const wards = await this.prisma.bedStatus.groupBy({
            by: ['ward'],
            _count: true,
        });

        const wardDetails = await Promise.all(
            wards.map(async (ward) => {
                const [available, occupied, maintenance] = await Promise.all([
                    this.prisma.bedStatus.count({ where: { ward: ward.ward, status: 'AVAILABLE' } }),
                    this.prisma.bedStatus.count({ where: { ward: ward.ward, status: 'OCCUPIED' } }),
                    this.prisma.bedStatus.count({ where: { ward: ward.ward, status: 'MAINTENANCE' } }),
                ]);

                return {
                    ward: ward.ward,
                    total: ward._count,
                    available,
                    occupied,
                    maintenance,
                };
            }),
        );

        return wardDetails;
    }
}
