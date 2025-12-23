import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBedDto, UpdateBedStatusDto } from './dto';

@Injectable()
export class EmergencyService {
    constructor(private prisma: PrismaService) { }

    async getDashboard() {
        const [criticalPatients, totalBeds, availableBeds, occupiedBeds, bedsByWard] = await Promise.all([
            // Now using EmergencyCase instead of Appointment
            this.prisma.emergencyCase.count({
                where: {
                    status: { in: ['TRIAGE', 'ADMITTED', 'OBSERVATION'] },
                    triageLevel: { lte: 2 }, // Levels 1 and 2 are critical/urgent
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
        return this.prisma.emergencyCase.findMany({
            where: {
                status: { in: ['TRIAGE', 'ADMITTED', 'OBSERVATION'] },
            },
            orderBy: { triageLevel: 'asc' }, // Lower number = Higher priority
        });
    }

    async getCaseById(id: string) {
        return this.prisma.emergencyCase.findUnique({
            where: { id }
        });
    }

    // [NEW] Get patient emergency history
    async getPatientHistory(patientId: string) {
        if (!patientId) return [];

        // Try to match by patient ID if we were storing it, 
        // or for now return empty since our seed data mocks names not IDs strictly linked yet.
        // However, we should try to match on something.
        // If we update EmergencyCase schema to have patientId, we can use it.
        // Since we didn't add patientId to EmergencyCase schema (only to Patient), 
        // we might have limited luck. 
        // WAIT: In Step 169 summary I said: "EmergencyCase ... patientId (opcional)".
        // So I can query it.

        return this.prisma.emergencyCase.findMany({
            where: {
                patientId: patientId
            },
            orderBy: { admissionDate: 'desc' }
        });
    }

    // [NEW] Helper to create emergency case
    async createEmergencyCase(data: any) {
        return this.prisma.emergencyCase.create({ data });
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
