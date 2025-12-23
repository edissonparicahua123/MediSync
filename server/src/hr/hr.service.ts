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

    async createShift(data: any) {
        return this.prisma.employeeShift.create({
            data: {
                employeeId: data.employeeId,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                type: data.type
            }
        });
    }

    // [NEW] Attendance Creation
    async createAttendance(data: any) {
        const checkIn = new Date(data.checkIn);
        const checkOut = data.checkOut ? new Date(data.checkOut) : null;
        let hoursWorked = 0;
        let tardiness = 0;

        if (checkOut) {
            hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        }

        if (data.status === 'LATE') {
            tardiness = 15; // Default 15 mins for manual late entry
        }

        return this.prisma.attendance.create({
            data: {
                employeeId: data.employeeId,
                checkIn,
                checkOut,
                status: data.status,
                hoursWorked: Number(hoursWorked.toFixed(2)),
                tardiness
            }
        });
    }

    // [NEW] Payroll Generation
    async generatePayroll() {
        const activeEmployees = await this.prisma.employee.findMany({
            where: { isActive: true, deletedAt: null }
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const payrolls = [];

        for (const emp of activeEmployees) {
            // Check if payroll already exists for this period
            const existing = await this.prisma.payroll.findFirst({
                where: {
                    employeeId: emp.id,
                    periodStart: startOfMonth
                }
            });

            if (existing) continue;

            // Simple calculation logic
            const baseSalary = Number(emp.salary) || 0;
            const pension = baseSalary * 0.13;
            // Random bonuses for demo
            const bonuses = Math.floor(Math.random() * 200);
            const totalDeductions = pension;
            const netSalary = baseSalary + bonuses - totalDeductions;

            const payroll = await this.prisma.payroll.create({
                data: {
                    employeeId: emp.id,
                    baseSalary,
                    bonuses,
                    deductions: totalDeductions,
                    netSalary,
                    periodStart: startOfMonth,
                    periodEnd: endOfMonth,
                    paidDate: now,
                    status: 'PAID'
                }
            });
            payrolls.push(payroll);
        }

        return payrolls;
    }
}
