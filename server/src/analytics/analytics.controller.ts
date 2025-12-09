import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
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
    getPatientStats() {
        return this.analyticsService.getPatientStats();
    }

    @Get('revenue/stats')
    @ApiOperation({ summary: 'Get revenue statistics' })
    getRevenueStats() {
        return this.analyticsService.getRevenueStats();
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard analytics data' })
    getDashboardData() {
        return this.analyticsService.getDashboardData();
    }
}
