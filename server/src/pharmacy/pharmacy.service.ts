import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PharmacyService {
    constructor(private prisma: PrismaService) { }

    async getMedications(query: any) {
        // Flattened view for frontend table
        const meds = await this.prisma.medication.findMany({
            where: { isActive: true },
            include: {
                stock: {
                    orderBy: { expirationDate: 'asc' } // Get nearest expiry first
                }
            }
        });

        // Transform to match frontend expectation
        return {
            data: meds.map(med => {
                const totalStock = med.stock.reduce((sum, item) => sum + item.quantity, 0);
                // Use the first stock batch for display details (batch, expiry)
                const mainBatch = med.stock[0] || ({} as any);

                return {
                    id: med.id,
                    name: med.name,
                    type: med.category || 'Medicamento',
                    laboratory: med.manufacturer || 'Generico',
                    currentStock: totalStock,
                    minStock: mainBatch.minStockLevel || 10,
                    batch: mainBatch.batchNumber || 'N/A',
                    expirationDate: mainBatch.expirationDate || new Date(),
                    description: med.description
                };
            })
        };
    }

    async getOrders() {
        // Safe check if model is loaded (Prisma client issues)
        try {
            const orders = await (this.prisma as any).pharmacyOrder.findMany({
                include: {
                    medication: true,
                    doctor: { include: { user: true } }, // To get doctor name
                    patient: true
                },
                orderBy: { requestedAt: 'desc' }
            });

            return orders.map((order: any) => ({
                id: order.id,
                medication: order.medication?.name || 'Unknown',
                quantity: order.quantity,
                doctor: order.doctor?.user?.lastName ? `Dr. ${order.doctor.user.lastName}` : 'Dr. Unknown',
                patient: order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : 'Unknown Patient',
                status: order.status, // PENDING, APPROVED, REJECTED
                requestedAt: order.requestedAt,
                approvedAt: order.approvedAt,
                approvedBy: order.approvedBy,
                rejectedAt: order.rejectedAt,
                rejectedBy: order.rejectedBy,
                rejectionReason: order.rejectionReason
            }));
        } catch (e) {
            console.error('Error fetching pharmacy orders (model might not exist yet):', e);
            return [];
        }
    }

    async getKardex() {
        try {
            const movements = await this.prisma.pharmacyMovement.findMany({
                include: {
                    medication: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return movements.map(mov => ({
                id: mov.id,
                date: mov.createdAt,
                medication: mov.medication.name,
                type: mov.movementType, // IN, OUT
                quantity: mov.quantity,
                batch: mov.referenceNumber || 'N/A',
                responsible: mov.performedBy || 'System',
                notes: mov.notes
            }));
        } catch (e) {
            console.error('Error fetching kardex (possibly model issue):', e);
            return [];
        }
    }

    async getMedication(id: string) {
        return this.prisma.medication.findUnique({
            where: { id },
            include: {
                stock: true,
            },
        });
    }

    async createMedication(data: any) {
        const { stock, minStock, batch, expiry, ...medData } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Medication
            const med = await tx.medication.create({
                data: {
                    name: medData.name,
                    manufacturer: medData.manufacturer,
                    description: medData.description,
                    category: medData.category || 'Medicamento',
                    isActive: true
                }
            });

            // 2. Create Initial Stock
            if (stock > 0 || minStock) {
                await tx.pharmacyStock.create({
                    data: {
                        medicationId: med.id,
                        quantity: Number(stock) || 0,
                        minStockLevel: Number(minStock) || 10,
                        batchNumber: batch || `INIT-${Date.now()}`,
                        expirationDate: expiry ? new Date(expiry) : undefined,
                        unitPrice: 0,
                        sellingPrice: 0
                    }
                });
            }

            return med;
        });
    }

    async updateMedication(id: string, data: any) {
        return this.prisma.medication.update({
            where: { id },
            data,
        });
    }

    async deleteMedication(id: string) {
        return this.prisma.medication.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
        });
    }

    async getStock(query: any) {
        return this.prisma.pharmacyStock.findMany({
            include: {
                medication: true,
            },
        });
    }

    async updateStock(id: string, data: any) {
        return this.prisma.pharmacyStock.update({
            where: { id },
            data,
        });
    }

    async getLowStock() {
        return this.prisma.pharmacyStock.findMany({
            where: {
                quantity: { lt: 10 } // Simplified logic
            },
            include: { medication: true }
        });
    }

    async updateOrder(id: string, data: any) {
        return (this.prisma as any).pharmacyOrder.update({
            where: { id },
            data
        });
    }

    async approveOrder(id: string, userId: string) {
        return (this.prisma as any).pharmacyOrder.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: 'Farmacéutico'
            }
        });
    }

    async rejectOrder(id: string, reason: string) {
        return (this.prisma as any).pharmacyOrder.update({
            where: { id },
            data: {
                status: 'RECHAZADO',
                rejectedAt: new Date(),
                rejectedBy: 'Farmacéutico',
                rejectionReason: reason
            }
        });
    }
}
