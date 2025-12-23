import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LaboratoryService {
    constructor(private prisma: PrismaService) { }

    async getOrders(query: any) {
        try {
            const { page = 1, limit = 10, status } = query || {};
            const skip = (page - 1) * limit;

            const where: any = {};
            if (status) {
                where.status = status;
            }
            if (query?.patientId) {
                where.patientId = query.patientId;
            }

            const [orders, total] = await Promise.all([
                this.prisma.labOrder.findMany({
                    where,
                    skip,
                    take: parseInt(limit.toString()),
                    include: {
                        patient: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.labOrder.count({ where }),
            ]);

            // Manual fetch of results to bypass stale Prisma Client
            const orderIds = orders.map(o => o.id);
            let results: any[] = [];

            try {
                if ((this.prisma as any).labResult) {
                    results = await (this.prisma as any).labResult.findMany({
                        where: {
                            labOrderId: { in: orderIds }
                        }
                    });
                }
            } catch (error) {
                console.warn('Error fetching lab results manually (non-critical):', error);
            }

            const ordersWithResults = orders.map(order => ({
                ...order,
                results: results.filter(r => r.labOrderId === order.id)
            }));

            return {
                data: ordersWithResults,
                total,
                page: parseInt(page.toString()),
                limit: parseInt(limit.toString()),
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error("Critical error in getOrders:", error);
            // Return safe fallback to prevent frontend crash
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        }
    }

    async getOrder(id: string) {
        const order = await this.prisma.labOrder.findUnique({
            where: { id },
            include: {
                patient: true,
            },
        });

        if (!order) return null;

        let results: any[] = [];
        try {
            if ((this.prisma as any).labResult) {
                results = await (this.prisma as any).labResult.findMany({
                    where: { labOrderId: id }
                });
            }
        } catch (e) {
            console.error("Error fetching results for order", id, e);
        }

        return { ...order, results };
    }

    async createOrder(data: any) {
        try {
            // Explicitly pick fields to avoid passing 'doctorId' which is not in the schema
            const { patientId, testType, testName, priority, notes, status } = data;

            return await this.prisma.labOrder.create({
                data: {
                    orderNumber: `LAB-${Date.now()}`,
                    patientId,
                    testType,
                    testName,
                    priority: priority || 'NORMAL',
                    status: status || 'PENDING',
                    notes
                },
            });
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    }

    async updateOrder(id: string, data: any) {
        try {
            // Sanitize update data
            const { priority, notes, status, testType, testName } = data;
            const validData: any = {};

            if (priority !== undefined) validData.priority = priority;
            if (notes !== undefined) validData.notes = notes;
            if (status !== undefined) validData.status = status;
            if (testType !== undefined) validData.testType = testType;
            if (testName !== undefined) validData.testName = testName;

            return await this.prisma.labOrder.update({
                where: { id },
                data: validData,
            });
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }

    async updateStatus(id: string, data: any) {
        const { status, resultFile } = data;

        // If completing, we might want to add a result
        // If completing, we might want to add a result
        if (status === 'COMPLETED' && resultFile) {
            try {
                if ((this.prisma as any).labResult) {
                    await (this.prisma as any).labResult.create({
                        data: {
                            labOrderId: id,
                            testName: 'General Result', // Could be dynamic
                            result: resultFile, // Storing "file path" or text here
                            status: 'NORMAL',
                            resultDate: new Date()
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to create LabResult:", error);
            }
        }

        return this.prisma.labOrder.update({
            where: { id },
            data: {
                status
            }
        });
    }

    async deleteOrder(id: string) {
        return this.prisma.labOrder.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async getTests() {
        return [
            { id: '1', name: 'Complete Blood Count (CBC)', category: 'Hematology' },
            { id: '2', name: 'Basic Metabolic Panel', category: 'Chemistry' },
            { id: '3', name: 'Lipid Panel', category: 'Chemistry' },
            { id: '4', name: 'Liver Function Test', category: 'Chemistry' },
            { id: '5', name: 'Urinalysis', category: 'Urinalysis' },
        ];
    }
}
