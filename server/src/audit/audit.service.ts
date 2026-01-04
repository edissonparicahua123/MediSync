import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async createLog(data: {
        userId: string;
        action: string;
        resource: string;
        resourceId?: string;
        changes?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId,
                changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : undefined,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        userId?: string;
        resource?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { skip, take, userId, resource, action, startDate, endDate } = params;

        const where: Prisma.AuditLogWhereInput = {
            userId: userId || undefined,
            resource: resource || undefined,
            action: action || undefined,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs,
            meta: {
                total,
                page: skip / take + 1,
                lastPage: Math.ceil(total / take),
            },
        };
    }

    async getHistory(resource: string, resourceId: string) {
        return this.prisma.auditLog.findMany({
            where: {
                resource,
                resourceId,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async getStats() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [totalLogs, logsToday, uniqueUsersToday] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                    },
                },
            }),
            this.prisma.auditLog.groupBy({
                by: ['userId'],
                where: {
                    createdAt: {
                        gte: startOfDay,
                    },
                },
            }),
        ]);

        return {
            totalLogs,
            logsToday,
            activeUsersToday: uniqueUsersToday.length,
        };
    }
}
