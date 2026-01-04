import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async getStatus(userId: string) {
        // Find the latest open attendance record
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                userId,
                checkOut: null,
            },
        });

        return {
            isClockedIn: !!activeSession,
            startTime: activeSession?.checkIn || null,
            session_id: activeSession?.id
        };
    }

    async clockIn(userId: string) {
        // Check if already clocked in
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                userId,
                checkOut: null,
            },
        });

        if (activeSession) {
            throw new BadRequestException('Ya tienes una sesión activa. Debes marcar salida primero.');
        }

        // Find linked Employee (via email matching) to keep HR sync
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('Usuario no encontrado');

        const employee = await this.prisma.employee.findUnique({
            where: { email: user.email },
        });

        return this.prisma.attendance.create({
            data: {
                userId,
                employeeId: employee?.id, // Link if found
                checkIn: new Date(),
                status: 'PRESENT',
            },
        });
    }

    async clockOut(userId: string) {
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                userId,
                checkOut: null,
            },
        });

        if (!activeSession) {
            throw new BadRequestException('No tienes una sesión activa para cerrar.');
        }

        const checkOut = new Date();
        const checkIn = new Date(activeSession.checkIn);

        // Calculate hours worked
        const diffMs = checkOut.getTime() - checkIn.getTime();
        const hoursWorked = diffMs / (1000 * 60 * 60);

        return this.prisma.attendance.update({
            where: { id: activeSession.id },
            data: {
                checkOut,
                hoursWorked: Number(hoursWorked.toFixed(2)),
            },
        });
    }

    async kioskClock(documentId: string) {
        // 1. Find the employee by documentId (DNI)
        const employee = await this.prisma.employee.findUnique({
            where: { documentId },
        });

        if (!employee) {
            throw new BadRequestException('Empleado no encontrado con ese DNI');
        }

        // 2. Check if they have an active session
        const activeSession = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                checkOut: null,
            },
        });

        if (activeSession) {
            // CLOCK OUT
            const checkOut = new Date();
            const diffMs = checkOut.getTime() - new Date(activeSession.checkIn).getTime();
            const hoursWorked = diffMs / (1000 * 60 * 60);

            await this.prisma.attendance.update({
                where: { id: activeSession.id },
                data: {
                    checkOut,
                    hoursWorked: Number(hoursWorked.toFixed(2)),
                },
            });
            return { action: 'CLOCK_OUT', employeeName: employee.name, time: checkOut };
        } else {
            // CLOCK IN
            const checkIn = new Date();

            // Calculate Tardiness based on shift
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const shift = await this.prisma.employeeShift.findFirst({
                where: {
                    employeeId: employee.id,
                    startTime: { gte: startOfDay, lte: endOfDay }
                }
            });

            let status = 'PRESENT';
            let tardiness = 0;

            if (shift) {
                const shiftStart = new Date(shift.startTime);
                if (checkIn.getTime() > shiftStart.getTime()) {
                    tardiness = Math.floor((checkIn.getTime() - shiftStart.getTime()) / (1000 * 60));
                    if (tardiness > 5) { // 5 mins grace period
                        status = 'LATE';
                    } else {
                        tardiness = 0; // Ignore minor delays
                    }
                }
            }

            await this.prisma.attendance.create({
                data: {
                    employeeId: employee.id,
                    checkIn,
                    status: status as any,
                    tardiness,
                },
            });
            return { action: 'CLOCK_IN', employeeName: employee.name, time: checkIn };
        }
    }

    async getKioskStats() {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const [totalEmployees, attendanceToday] = await Promise.all([
            this.prisma.employee.count({
                where: { isActive: true, deletedAt: null },
            }),
            this.prisma.attendance.findMany({
                where: {
                    checkIn: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            }),
        ]);

        const present = attendanceToday.length;
        const late = attendanceToday.filter(a => a.status === 'LATE').length;
        const onTime = present - late;

        return {
            present,
            total: totalEmployees,
            onTime,
            late,
        };
    }
}
