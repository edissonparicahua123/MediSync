import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PharmacyService {
    constructor(private prisma: PrismaService) { }

    async getMedications(query: any) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { genericName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.medication.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    stock: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.medication.count({ where }),
        ]);

        return {
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
        };
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
        return this.prisma.medication.create({
            data,
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
            data: { deletedAt: new Date() },
        });
    }

    async getStock(query: any) {
        return this.prisma.pharmacyStock.findMany({
            include: {
                medication: true,
            },
        });
    }

    async getLowStock() {
        // Return empty array for now since we don't have reorderLevel field
        return [];
    }

    async updateStock(id: string, data: any) {
        return this.prisma.pharmacyStock.update({
            where: { id },
            data,
        });
    }
}
