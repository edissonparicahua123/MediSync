import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConfigDto, UpdateConfigDto } from './dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async createConfig(data: CreateConfigDto) {
        return this.prisma.systemConfig.create({ data });
    }

    async getAllConfigs(category?: string) {
        const where: any = {};
        if (category) where.category = category;

        return this.prisma.systemConfig.findMany({
            where,
            orderBy: { category: 'asc' },
        });
    }

    async getConfigById(id: string) {
        return this.prisma.systemConfig.findUnique({ where: { id } });
    }

    async updateConfig(id: string, data: UpdateConfigDto) {
        return this.prisma.systemConfig.update({
            where: { id },
            data,
        });
    }

    async deleteConfig(id: string) {
        return this.prisma.systemConfig.delete({ where: { id } });
    }

    async getServicesByCategory() {
        return this.prisma.systemConfig.groupBy({
            by: ['category'],
            _count: true,
            _avg: { price: true },
        });
    }
}
