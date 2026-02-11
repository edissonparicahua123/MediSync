import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';
import { NotificationsService } from '../notifications/notifications.service';

import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { Audit } from '../common/decorators/audit.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@UseInterceptors(AuditInterceptor)
@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService,
        private readonly notificationsService: NotificationsService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create new appointment with AI triage' })
    @Audit('CREATE_APPOINTMENT', 'appointments')
    create(@Body() createDto: any) {
        return this.appointmentsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all appointments with filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'doctorId', required: false })
    @ApiQuery({ name: 'patientId', required: false })
    @ApiQuery({ name: 'date', required: false })
    findAll(@Query() query: any) {
        const { page, limit, ...filters } = query;
        return this.appointmentsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            filters,
        );
    }

    @Get(':id/notifications')
    @ApiOperation({ summary: 'Get appointment notifications' })
    async getNotifications(@Param('id') id: string) {
        return this.notificationsService.findByRelatedEntity('APPOINTMENT', id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get appointment by ID' })
    findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update appointment status' })
    @Audit('UPDATE_APPOINTMENT_STATUS', 'appointments')
    updateStatus(@Param('id') id: string, @Body() body: { status: string; notes?: string }) {
        return this.appointmentsService.updateStatus(id, body.status, body.notes);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update appointment' })
    @Audit('UPDATE_APPOINTMENT', 'appointments')
    update(@Param('id') id: string, @Body() data: any) {
        return this.appointmentsService.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete appointment' })
    @Audit('DELETE_APPOINTMENT', 'appointments')
    remove(@Param('id') id: string) {
        return this.appointmentsService.remove(id);
    }
}
