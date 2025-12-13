import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateBedDto, UpdateBedStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Emergency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency')
export class EmergencyController {
    constructor(private readonly emergencyService: EmergencyService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get emergency dashboard data' })
    getDashboard() {
        return this.emergencyService.getDashboard();
    }

    @Get('critical-patients')
    @ApiOperation({ summary: 'Get critical patients list' })
    getCriticalPatients() {
        return this.emergencyService.getCriticalPatients();
    }

    @Get('history/:patientId')
    @ApiOperation({ summary: 'Get patient emergency history' })
    getPatientHistory(@Param('patientId') patientId: string) {
        return this.emergencyService.getPatientHistory(patientId);
    }

    @Post('beds')
    @ApiOperation({ summary: 'Create new bed' })
    createBed(@Body() createBedDto: CreateBedDto) {
        return this.emergencyService.createBed(createBedDto);
    }

    @Get('beds')
    @ApiOperation({ summary: 'Get all beds' })
    @ApiQuery({ name: 'ward', required: false })
    getAllBeds(@Query('ward') ward?: string) {
        return this.emergencyService.getAllBeds(ward);
    }

    @Get('beds/:id')
    @ApiOperation({ summary: 'Get bed by ID' })
    getBedById(@Param('id') id: string) {
        return this.emergencyService.getBedById(id);
    }

    @Put('beds/:id')
    @ApiOperation({ summary: 'Update bed status' })
    updateBedStatus(@Param('id') id: string, @Body() updateBedStatusDto: UpdateBedStatusDto) {
        return this.emergencyService.updateBedStatus(id, updateBedStatusDto);
    }

    @Get('wards/stats')
    @ApiOperation({ summary: 'Get ward statistics' })
    getWardStats() {
        return this.emergencyService.getWardStats();
    }
}
