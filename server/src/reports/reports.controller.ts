import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('appointments')
    getAppointmentStats() {
        return this.reportsService.getAppointmentStats();
    }

    @Get('patients')
    getPatientStats() {
        return this.reportsService.getPatientStats();
    }

    @Get('finance')
    getFinancialStats() {
        return this.reportsService.getFinancialStats();
    }

    @Get('medications')
    getMedicationStats() {
        return this.reportsService.getMedicationStats();
    }

    @Get('doctors')
    getDoctorStats() {
        return this.reportsService.getDoctorStats();
    }

    @Get('emergencies')
    getEmergencyStats() {
        return this.reportsService.getEmergencyStats();
    }

    @Get('comparison')
    getComparisonStats() {
        return this.reportsService.getComparisonStats();
    }

    @Get('ai-predictions')
    getAiPredictions() {
        return this.reportsService.getAiPredictions();
    }
}
