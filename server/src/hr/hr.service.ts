import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

@Injectable()
export class HRService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateEmployeeDto) {
        return this.prisma.employee.create({
            data: {
                ...data,
                hireDate: new Date(data.hireDate),
            },
        });
    }

    async findAll(page: number = 1, limit: number = 10, department?: string, role?: string) {
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
        };

        if (department) where.department = department;
        if (role) where.role = role;

        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.employee.count({ where }),
        ]);

        return {
            data: employees,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        return this.prisma.employee.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: UpdateEmployeeDto) {
        return this.prisma.employee.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.employee.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async getStats() {
        const [total, byDepartment, byRole, activeCount] = await Promise.all([
            this.prisma.employee.count({ where: { deletedAt: null } }),
            this.prisma.employee.groupBy({
                by: ['department'],
                where: { deletedAt: null },
                _count: true,
            }),
            this.prisma.employee.groupBy({
                by: ['role'],
                where: { deletedAt: null },
                _count: true,
            }),
            this.prisma.employee.count({ where: { deletedAt: null, isActive: true } }),
        ]);

        return {
            total,
            active: activeCount,
            inactive: total - activeCount,
            byDepartment,
            byRole,
        };
    }

    // [NEW] Attendance Methods
    async getAttendance(date?: Date) {
        const where: any = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.checkIn = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        return this.prisma.attendance.findMany({
            where,
            include: {
                employee: true,
            },
            orderBy: { checkIn: 'desc' },
        });
    }

    // [NEW] Payroll Methods
    async getPayroll(periodStart?: Date, periodEnd?: Date) {
        return this.prisma.payroll.findMany({
            include: {
                employee: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // [NEW] Shift Methods
    async getShifts() {
        return this.prisma.employeeShift.findMany({
            include: {
                employee: true,
            },
            orderBy: [{ startTime: 'asc' }],
        });
    }
}
