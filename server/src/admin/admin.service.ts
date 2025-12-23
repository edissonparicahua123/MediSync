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

    // New Organization Config Methods
    async getOrganizationConfig() {
        const config = await (this.prisma as any).organizationConfig.findFirst();
        if (!config) {
            return (this.prisma as any).organizationConfig.create({
                data: {
                    hospitalName: 'MediSync Hospital',
                    email: 'contact@medisync.com',
                    phone: '+1 555 123 4567',
                    openingHours: {
                        monday: { open: '08:00', close: '20:00', enabled: true },
                        tuesday: { open: '08:00', close: '20:00', enabled: true },
                        wednesday: { open: '08:00', close: '20:00', enabled: true },
                        thursday: { open: '08:00', close: '20:00', enabled: true },
                        friday: { open: '08:00', close: '20:00', enabled: true },
                        saturday: { open: '09:00', close: '14:00', enabled: true },
                        sunday: { open: '00:00', close: '00:00', enabled: false },
                    },
                    billing: {
                        taxRate: 18,
                        currency: 'PEN',
                        invoicePrefix: 'F',
                    },
                    ai: {
                        enabled: true,
                        model: 'GPT-4',
                        features: { triage: true, diagnosis: true },
                    }
                }
            });
        }
        return config;
    }

    async updateOrganizationConfig(data: any) {
        const config = await this.getOrganizationConfig();
        return (this.prisma as any).organizationConfig.update({
            where: { id: config.id },
            data,
        });
    }

    // Backup Methods
    async getBackups() {
        return (this.prisma as any).backupLog.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createBackup() {
        // Stimulate backup creation
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
        return (this.prisma as any).backupLog.create({
            data: {
                name: `backup_${dateStr}_full.sql`,
                type: 'FULL',
                size: `${Math.floor(Math.random() * 500) + 100} MB`,
                status: 'COMPLETED',
            }
        });
    }
}
