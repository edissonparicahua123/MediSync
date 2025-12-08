import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getAppointmentsByDay(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const appointments = await this.prisma.appointment.groupBy({
            by: ['appointmentDate'],
            where: {
                appointmentDate: { gte: startDate },
            },
            _count: true,
            orderBy: { appointmentDate: 'asc' },
        });

        return appointments.map((item) => ({
            date: item.appointmentDate.toISOString().split('T')[0],
            count: item._count,
        }));
    }

    async getAppointmentsByPriority() {
        return this.prisma.appointment.groupBy({
            by: ['priority'],
            _count: true,
        });
    }

    async getAppointmentsByStatus() {
        return this.prisma.appointment.groupBy({
            by: ['status'],
            _count: true,
        });
    }

    async getPatientStats() {
        const [total, byGender, byStatus, newThisMonth] = await Promise.all([
            this.prisma.patient.count({ where: { deletedAt: null } }),
            this.prisma.patient.groupBy({
                by: ['gender'],
                where: { deletedAt: null },
                _count: true,
            }),
            this.prisma.patient.groupBy({
                by: ['status'],
                where: { deletedAt: null },
                _count: true,
            }),
            this.prisma.patient.count({
                where: {
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return {
            total,
            newThisMonth,
            byGender,
            byStatus,
        };
    }

    async getRevenueStats() {
        const [totalRevenue, paidInvoices, pendingRevenue, thisMonthRevenue] = await Promise.all([
            this.prisma.invoice.aggregate({
                _sum: { total: true },
                where: { status: 'PAID' },
            }),
            this.prisma.invoice.count({ where: { status: 'PAID' } }),
            this.prisma.invoice.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
            }),
            this.prisma.invoice.aggregate({
                _sum: { total: true },
                where: {
                    status: 'PAID',
                    invoiceDate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            paidInvoices,
            pendingRevenue: pendingRevenue._sum.total || 0,
            thisMonthRevenue: thisMonthRevenue._sum.total || 0,
        };
    }

    async getDashboardData() {
        const [appointments, patients, revenue, recentAppointments] = await Promise.all([
            this.getAppointmentsByPriority(),
            this.getPatientStats(),
            this.getRevenueStats(),
            this.prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);

        return {
            appointments,
            patients,
            revenue,
            todayAppointments: recentAppointments,
        };
    }
}
