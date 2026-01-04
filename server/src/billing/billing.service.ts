import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async getInvoices(query: any) {
        try {
            const { page = 1, limit = 10, status } = query || {};
            const skip = (page - 1) * limit;

            const where: any = {};
            if (status && status !== 'all') {
                where.status = status;
            }
            if (query?.patientId) {
                where.patientId = query.patientId;
            }

            const [data, total] = await Promise.all([
                this.prisma.invoice.findMany({
                    where,
                    skip,
                    take: parseInt(limit.toString()),
                    include: {
                        patient: true,
                        items: true,
                        payments: true
                    },
                    orderBy: { invoiceDate: 'desc' },
                }),
                this.prisma.invoice.count({ where }),
            ]);

            return {
                data,
                total,
                page: parseInt(page.toString()),
                limit: parseInt(limit.toString()),
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error("Error getting invoices:", error);
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        }
    }

    async getInvoice(id: string) {
        try {
            return await this.prisma.invoice.findUnique({
                where: { id },
                include: {
                    patient: true,
                    items: true,
                    payments: true,
                },
            });
        } catch (error) {
            console.error("Error getting invoice:", error);
            // Return null if not found or error, simpler for frontend to handle than 500
            return null;
        }
    }

    async createInvoice(data: any) {
        try {
            const { patientId, items, discount, tax, total, paymentMethod } = data;

            // Generate invoice number
            const invoiceNumber = `INV-${Date.now()}`;

            // Use transaction to ensure both header and items are created
            return await this.prisma.invoice.create({
                data: {
                    invoiceNumber,
                    patientId,
                    subtotal: total - (tax || 0) + (discount || 0), // Approximation if not sent
                    tax: tax || 0,
                    discount: discount || 0,
                    total: total,
                    status: 'PENDING', // Default status
                    items: {
                        create: items.map((item: any) => ({
                            description: item.name || item.description,
                            quantity: item.quantity || 1,
                            unitPrice: item.price || item.unitPrice,
                            total: (item.price || item.unitPrice) * (item.quantity || 1)
                        }))
                    }
                },
                include: {
                    items: true,
                    patient: true,
                    payments: true
                }
            });
        } catch (error) {
            console.error("Error creating invoice:", error);
            throw error;
        }
    }

    async updateInvoice(id: string, data: any) {
        try {
            const { items, patient, payments, ...invoiceData } = data;

            return await this.prisma.$transaction(async (tx) => {
                // 1. Update invoice header
                const updatedInvoice = await tx.invoice.update({
                    where: { id },
                    data: {
                        ...invoiceData,
                        subtotal: data.total - (data.tax || 0) + (data.discount || 0), // Recalculate if needed
                    }
                });

                // 2. Update items (Replace strategy: Delete all and recreate)
                if (items && Array.isArray(items)) {
                    await tx.invoiceItem.deleteMany({
                        where: { invoiceId: id }
                    });

                    await tx.invoiceItem.createMany({
                        data: items.map((item: any) => ({
                            invoiceId: id,
                            description: item.description,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            total: Number(item.quantity) * Number(item.unitPrice)
                        }))
                    });
                }

                return updatedInvoice;
            });
        } catch (error) {
            console.error("Error updating invoice:", error);
            throw error;
        }
    }

    async deleteInvoice(id: string) {
        return this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async updateStatus(id: string, data: any) {
        try {
            const { status } = data;
            return await this.prisma.invoice.update({
                where: { id },
                data: {
                    status,
                },
            });
        } catch (error) {
            console.error("Error updating invoice status:", error);
            throw error;
        }
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
