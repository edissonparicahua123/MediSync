import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AppointmentsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    async create(data: any) {
        // Get AI triage if symptoms provided
        let triageScore = null;
        let triageNotes = null;
        let priority = data.priority || 'NORMAL';

        if (data.symptoms) {
            try {
                const triage = await this.aiService.predictTriage({
                    symptoms: data.symptoms,
                    age: 30, // Would get from patient
                    vitalSigns: {},
                });
                triageScore = triage.score;
                triageNotes = triage.notes;
                priority = triage.priority;
            } catch (error) {
                console.error('AI triage failed:', error);
            }
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                ...data,
                triageScore,
                triageNotes,
                priority,
            },
            include: {
                patient: true,
                doctor: { include: { user: true, specialty: true } },
            },
        });

        // Create history entry
        await this.prisma.appointmentHistory.create({
            data: {
                appointmentId: appointment.id,
                status: 'SCHEDULED',
                notes: 'Appointment created',
            },
        });

        return appointment;
    }

    async findAll(page: number = 1, limit: number = 20, filters?: any) {
        const skip = (page - 1) * limit;
        const where: any = { deletedAt: null };

        if (filters?.status) where.status = filters.status;
        if (filters?.doctorId) where.doctorId = filters.doctorId;
        if (filters?.patientId) where.patientId = filters.patientId;
        if (filters?.date) {
            where.appointmentDate = {
                gte: new Date(filters.date),
                lt: new Date(new Date(filters.date).setDate(new Date(filters.date).getDate() + 1)),
            };
        }

        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                include: {
                    patient: true,
                    doctor: { include: { user: true, specialty: true } },
                },
                skip,
                take: limit,
                orderBy: { appointmentDate: 'desc' },
            }),
            this.prisma.appointment.count({ where }),
        ]);

        return {
            data: appointments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: { include: { user: true, specialty: true } },
                history: { orderBy: { createdAt: 'desc' } },
                medicalRecords: true,
            },
        });

        if (!appointment || appointment.deletedAt) {
            throw new NotFoundException('Appointment not found');
        }

        return appointment;
    }

    async updateStatus(id: string, status: string, notes?: string) {
        await this.findOne(id);

        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                patient: true,
                doctor: { include: { user: true } },
            },
        });

        // Create history entry
        await this.prisma.appointmentHistory.create({
            data: {
                appointmentId: id,
                status,
                notes: notes || `Status changed to ${status}`,
            },
        });

        return updated;
    }
    async update(id: string, data: any) {
        // Separate symptoms/triage data if we want to re-run AI, 
        // strictly speaking simple update might not re-trigger AI for stability unless requested.
        // For now, basic field update.

        return this.prisma.appointment.update({
            where: { id },
            data,
            include: {
                patient: true,
                doctor: { include: { user: true, specialty: true } },
            },
        });
    }

    async remove(id: string) {
        return this.prisma.appointment.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
