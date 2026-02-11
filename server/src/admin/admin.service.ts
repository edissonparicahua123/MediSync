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
            // _avg: { price: true }, // price doesn't exist on SystemConfig, check if this was meant for a Service model?
            // Assuming this was a placeholder. SystemConfig has no price. Removing _avg to prevent error.
        });
    }

    // New Organization Config Methods
    async getOrganizationConfig() {
        const config = await this.prisma.organizationConfig.findFirst();
        if (!config) {
            return this.prisma.organizationConfig.create({
                data: {
                    hospitalName: 'EdiCarex Hospital',
                    email: 'contact@edicarex.com',
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
                        model: 'Llama 3.3 LPU',
                        features: { triage: true, diagnosis: true },
                    },
                    maintenanceMode: false
                } as any,
            });
        }
        return config;
    }

    async updateOrganizationConfig(data: any) {
        const config = await this.getOrganizationConfig();
        return this.prisma.organizationConfig.update({
            where: { id: config.id },
            data,
        });
    }

    // Backup Methods
    async getBackups() {
        return this.prisma.backupLog.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createBackup() {
        // Stimulate backup creation
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
        return this.prisma.backupLog.create({
            data: {
                name: `backup_${dateStr}_full.sql`,
                type: 'FULL',
                size: `${Math.floor(Math.random() * 500) + 100} MB`,
                status: 'COMPLETED',
            }
        });
    }

    async restoreBackup(id: string) {
        const backup = await this.prisma.backupLog.findUnique({ where: { id } });
        if (!backup) throw new Error('Backup no encontrado');

        // Logic to simulate restoration log
        return { message: 'Iniciando restauración...', backupName: backup.name };
    }

    // System Monitoring Methods
    async getSystemStats() {
        const os = require('os');
        const cpus = os.cpus();
        const memTotal = os.totalmem();
        const memFree = os.freemem();
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        // Database stats
        const [userCount, patientCount, appointmentCount, backupCount] = await Promise.all([
            this.prisma.user.count({
                where: {
                    deletedAt: null,
                    role: {
                        name: { not: 'PATIENT' }
                    }
                }
            }),
            this.prisma.patient.count({ where: { deletedAt: null } }),
            this.prisma.appointment.count({ where: { deletedAt: null } }),
            this.prisma.backupLog.count()
        ]);

        return {
            infrastructure: {
                cpu: {
                    model: cpus[0].model,
                    cores: cpus.length,
                    usage: Math.floor(Math.random() * 30) + 5,
                },
                memory: {
                    total: Math.round(memTotal / (1024 * 1024 * 1024)),
                    free: Math.round(memFree / (1024 * 1024 * 1024)),
                    usagePercent: Math.round(((memTotal - memFree) / memTotal) * 100),
                },
                uptime: { days, hours, minutes },
                nodeVersion: process.version,
                platform: os.platform(),
            },
            database: {
                engine: 'PostgreSQL / Prisma',
                counts: {
                    users: userCount,
                    patients: patientCount,
                    appointments: appointmentCount,
                    backups: backupCount
                }
            }
        };
    }

    async getSystemHealth() {
        // Here we could ping external services
        const services = [
            { id: 'database', name: 'Base de Datos', type: 'CORE' },
            { id: 'ai-engine', name: 'Motor IA (MediSync AI)', type: 'AI' },
            { id: 'smtp', name: 'Servidor Correo', type: 'NET' },
            { id: 'backup-storage', name: 'Almacenamiento Local', type: 'STORAGE' }
        ];

        // Simulate check
        return services.map(s => ({
            ...s,
            status: 'OPERATIONAL',
            latency: Math.floor(Math.random() * 50) + 10,
            lastCheck: new Date()
        }));
    }
}
