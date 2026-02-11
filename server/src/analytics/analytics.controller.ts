import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('appointments/by-day')
    @ApiOperation({ summary: 'Get appointments by day' })
    @ApiQuery({ name: 'days', required: false })
    getAppointmentsByDay(@Query('days') days?: string) {
        return this.analyticsService.getAppointmentsByDay(days ? parseInt(days) : 30);
    }

    @Get('appointments/by-priority')
    @ApiOperation({ summary: 'Get appointments by priority' })
    getAppointmentsByPriority() {
        return this.analyticsService.getAppointmentsByPriority();
    }

    @Get('appointments/by-status')
    @ApiOperation({ summary: 'Get appointments by status' })
    getAppointmentsByStatus() {
        return this.analyticsService.getAppointmentsByStatus();
    }

    @Get('patients/stats')
    @ApiOperation({ summary: 'Get patient statistics' })
    getPatientStats(@Query('range') range?: string) {
        return this.analyticsService.getPatientStats(range);
    }

    @Get('revenue/stats')
    @ApiOperation({ summary: 'Get revenue statistics' })
    getRevenueStats(@Query('range') range?: string) {
        return this.analyticsService.getRevenueStats(range);
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard analytics data' })
    getDashboardData(@Query('range') range?: string) {
        return this.analyticsService.getDashboardData(range);
    }

    @Get('heatmap')
    getHeatmapData(@Query('range') range?: string) {
        return this.analyticsService.getHeatmapData(range);
    }

    @Get('saturation')
    getSaturationStats() {
        return this.analyticsService.getSaturationStats();
    }

    @Get('area-comparison')
    getAreaComparison(@Query('range') range?: string) {
        return this.analyticsService.getAreaComparison(range);
    }

    @Get('patient-cycle')
    getPatientCycle(@Query('range') range?: string) {
        return this.analyticsService.getPatientCycle(range);
    }

    @Get('capacity')
    getCapacityStats(@Query('range') range?: string) {
        return this.analyticsService.getCapacityStats(range);
    }

    @Get('historical')
    getHistoricalTrends(@Query('range') range?: string) {
        return this.analyticsService.getHistoricalTrends(range);
    }

    @Get('appointments/types')
    getAppointmentTypes(@Query('range') range?: string) {
        return this.analyticsService.getAppointmentTypes(range);
    }

    @Get('lab/stats')
    getLabStats(@Query('range') range?: string) {
        return this.analyticsService.getLabCategoryDistribution(range);
    }

    @Get('pharmacy/top-meds')
    getTopMeds(@Query('range') range?: string) {
        return this.analyticsService.getTopMedications(range);
    }

    @Get('patients/age-distribution')
    getAgeDistribution(@Query('range') range?: string) {
        return this.analyticsService.getAgeDistribution(range);
    }
}
