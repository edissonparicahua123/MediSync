import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async getInvoices(query: any) {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    patient: true,
                },
                orderBy: { invoiceDate: 'desc' },
            }),
            this.prisma.invoice.count({ where }),
        ]);

        return {
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    async getInvoice(id: string) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                patient: true,
                items: true,
            },
        });
    }

    async createInvoice(data: any) {
        return this.prisma.invoice.create({
            data,
        });
    }

    async updateInvoice(id: string, data: any) {
        return this.prisma.invoice.update({
            where: { id },
            data,
        });
    }

    async deleteInvoice(id: string) {
        return this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async updateStatus(id: string, data: any) {
        const { status } = data;
        return this.prisma.invoice.update({
            where: { id },
            data: {
                status,
            },
        });
    }

    async getStats() {
        const [totalRevenue, paidInvoices, pendingInvoices, overdueInvoices] = await Promise.all([
            this.prisma.invoice.aggregate({
                where: { status: 'PAID' },
                _sum: { total: true },
            }),
            this.prisma.invoice.count({ where: { status: 'PAID' } }),
            this.prisma.invoice.count({ where: { status: 'PENDING' } }),
            this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        ]);

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
        };
    }
}
