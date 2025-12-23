import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const [todayAppointments, totalPatients, totalDoctors, pendingInvoices] = await Promise.all([
            this.prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            }),
            this.prisma.patient.count(),
            this.prisma.doctor.count(),
            this.prisma.invoice.count({ where: { status: 'PENDING' } })
        ]);

        return {
            todayAppointments,
            totalPatients,
            totalDoctors,
            pendingInvoices
        };
    }

    async getAppointmentStats() {
        // Group by month is tricky in Prisma/Postgres without raw query, so we'll fetch all and process in JS for MVP
        // or prioritize this year's appointments
        const currentYear = new Date().getFullYear();
        const appointments = await this.prisma.appointment.findMany({
            where: {
                appointmentDate: {
                    gte: new Date(`${currentYear}-01-01`),
                    lte: new Date(`${currentYear}-12-31`)
                }
            },
            select: {
                appointmentDate: true,
                status: true
            }
        });

        // Process into monthly stats
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const stats = months.map((month, index) => {
            const monthlyApps = appointments.filter(a => new Date(a.appointmentDate).getMonth() === index);
            return {
                month,
                total: monthlyApps.length,
                completed: monthlyApps.filter(a => a.status === 'COMPLETED').length,
                cancelled: monthlyApps.filter(a => a.status === 'CANCELLED').length
            };
        });

        return stats;
    }

    async getPatientStats() {
        const currentYear = new Date().getFullYear();
        const patients = await this.prisma.patient.findMany({
            where: {
                createdAt: {
                    gte: new Date(`${currentYear}-01-01`),
                }
            },
            select: { createdAt: true }
        });

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return months.map((month, index) => ({
            month,
            count: patients.filter(p => new Date(p.createdAt).getMonth() === index).length
        }));
    }

    async getFinancialStats() {
        // Aggregate invoices by status and month
        const currentYear = new Date().getFullYear();
        const invoices = await this.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: new Date(`${currentYear}-01-01`),
                }
            },
            select: {
                createdAt: true,
                total: true,
                status: true
            }
        });

        const totalRevenue = invoices
            .filter(i => i.status === 'PAID')
            .reduce((sum, i) => sum + Number(i.total), 0);

        // Simplified expenses (assuming 60% of revenue for MVP demo as we don't have expenses table)
        const totalExpenses = totalRevenue * 0.6;

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthlyBreakdown = months.map((month, index) => {
            const monthlyInvoices = invoices.filter(i => new Date(i.createdAt).getMonth() === index);
            const revenue = monthlyInvoices
                .filter(i => i.status === 'PAID')
                .reduce((sum, i) => sum + Number(i.total), 0);

            return {
                month,
                revenue,
                expenses: revenue * 0.6 // Simulated expenses
            };
        });

        return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0,
            monthlyBreakdown
        };
    }

    async getMedicationStats() {
        const medications = await this.prisma.medication.findMany({
            include: {
                stock: true
            }
        });

        // Return top 5 by value
        return medications.map(m => {
            // Aggregate stock from all batches
            const totalStock = m.stock.reduce((sum, s) => sum + s.quantity, 0);
            const totalValue = m.stock.reduce((sum, s) => sum + (s.quantity * Number(s.unitPrice)), 0);

            return {
                name: m.name,
                quantity: totalStock,
                cost: totalValue
            }
        })
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);
    }

    async getDoctorStats() {
        const doctors = await this.prisma.doctor.findMany({
            include: {
                user: {
                    select: { firstName: true, lastName: true }
                },
                appointments: {
                    select: { status: true }
                },
                _count: {
                    select: { appointments: true }
                }
            }
        });

        return doctors.map(d => ({
            name: `${d.user.firstName} ${d.user.lastName}`,
            patients: d._count.appointments,
            satisfaction: 4.5 + (Math.random() * 0.5), // Simulated as we don't have reviews yet
            revenue: d._count.appointments * 50 // Est. revenue
        })).sort((a, b) => b.patients - a.patients).slice(0, 5);
    }

    async getEmergencyStats() {
        const cases = await this.prisma.emergencyCase.findMany({
            select: {
                triageLevel: true,
                status: true,
                createdAt: true,
                dischargedAt: true
            }
        });

        // Map triage level to category
        const triageMap = {
            1: 'Crítica',    // Resuscitation
            2: 'Emergencia', // Emergency
            3: 'Urgente',    // Urgent
            4: 'Semi-Urgente', // Less Urgent
            5: 'No Urgente'  // Non Urgent
        };

        const stats = [1, 2, 3, 4, 5].map(level => {
            const levelCases = cases.filter(c => c.triageLevel === level);

            // Calculate average time in minutes (if discharged)
            const completedCases = levelCases.filter(c => c.dischargedAt);
            const totalTime = completedCases.reduce((sum, c) => {
                const diff = new Date(c.dischargedAt).getTime() - new Date(c.createdAt).getTime();
                return sum + diff;
            }, 0);

            const avgTime = completedCases.length > 0
                ? Math.round((totalTime / completedCases.length) / 60000) // ms to min
                : 0;

            return {
                type: triageMap[level],
                count: levelCases.length,
                avgTime
            };
        });

        return stats.filter(s => s.count > 0);
    }

    async getComparisonStats() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const lastYear = currentYear - 1;

        // Get monthly revenue for current year
        const currentYearInvoices = await this.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: new Date(`${currentYear}-01-01`),
                    lte: new Date(`${currentYear}-12-31`)
                },
                status: 'PAID'
            },
            select: { createdAt: true, total: true }
        });

        // Get monthly revenue for last year
        const lastYearInvoices = await this.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: new Date(`${lastYear}-01-01`),
                    lte: new Date(`${lastYear}-12-31`)
                },
                status: 'PAID'
            },
            select: { createdAt: true, total: true }
        });

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return months.map((month, index) => {
            const currentTotal = currentYearInvoices
                .filter(i => new Date(i.createdAt).getMonth() === index)
                .reduce((sum, i) => sum + Number(i.total), 0);

            const previousTotal = lastYearInvoices
                .filter(i => new Date(i.createdAt).getMonth() === index)
                .reduce((sum, i) => sum + Number(i.total), 0);

            return {
                month,
                current: currentTotal,
                previous: previousTotal
            };
        });
    }

    async getAiPredictions() {
        // Simple linear regression or moving average based on last 3 months
        const stats = await this.getFinancialStats();
        const monthlyData = stats.monthlyBreakdown;

        // Filter out months with 0 revenue (future months)
        const activeMonths = monthlyData.filter(m => m.revenue > 0);

        if (activeMonths.length < 2) {
            // Fallback if not enough data
            return [
                { month: 'Jul', predicted: 0, confidence: 50 },
                { month: 'Ago', predicted: 0, confidence: 40 },
            ];
        }

        const lastMonthRevenue = activeMonths[activeMonths.length - 1].revenue;
        const growthRate = activeMonths.length >= 2
            ? (lastMonthRevenue / activeMonths[activeMonths.length - 2].revenue)
            : 1.05;

        // Predict next 6 months
        const nextMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const startIdx = activeMonths.length; // Start overlapping or next

        const predictions = [];
        let currentPrediction = lastMonthRevenue;
        let confidence = 90;

        for (let i = 0; i < 6; i++) {
            const monthIdx = (startIdx + i) % 12;
            currentPrediction = currentPrediction * (Math.random() * 0.1 + 0.95) * (growthRate > 2 ? 1.1 : growthRate); // +/- 5% variance + trend
            confidence -= 5; // Confidence drops over time

            predictions.push({
                month: nextMonths[monthIdx],
                predicted: Math.round(currentPrediction),
                confidence
            });
        }

        return predictions;
    }

}
