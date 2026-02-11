import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // ============================================
    // USER NOTIFICATIONS
    // ============================================
    @Get()
    @ApiOperation({ summary: 'Get current user notifications' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getNotifications(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.notificationsService.getNotifications(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    getUnreadCount(@Request() req) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    deleteNotification(@Param('id') id: string) {
        return this.notificationsService.deleteNotification(id);
    }

    // ============================================
    // PREFERENCES
    // ============================================
    @Get('preferences')
    @ApiOperation({ summary: 'Get notification preferences' })
    getPreferences(@Request() req) {
        return this.notificationsService.getPreferences(req.user.id);
    }

    @Put('preferences')
    @ApiOperation({ summary: 'Update notification preferences' })
    updatePreferences(@Request() req, @Body() data: any) {
        return this.notificationsService.updatePreferences(req.user.id, data);
    }

    // ============================================
    // MANUAL SEND (Admin only)
    // ============================================
    @Post('send')
    @ApiOperation({ summary: 'Send notification to user' })
    createNotification(@Body() data: any) {
        return this.notificationsService.createNotification(data);
    }

    @Post('send-appointment-reminder')
    @ApiOperation({ summary: 'Send appointment reminder' })
    sendAppointmentReminder(@Body() body: { appointmentId: string }) {
        return this.notificationsService.sendAppointmentReminder(body.appointmentId);
    }

    @Post('send-lab-ready')
    @ApiOperation({ summary: 'Send lab result ready notification' })
    sendLabResultReady(@Body() body: { labOrderId: string }) {
        return this.notificationsService.sendLabResultReady(body.labOrderId);
    }

    // ============================================
    // TEMPLATES (Admin only)
    // ============================================
    @Get('templates')
    @ApiOperation({ summary: 'Get notification templates' })
    getTemplates() {
        return this.notificationsService.getTemplates();
    }

    @Post('templates')
    @ApiOperation({ summary: 'Create notification template' })
    createTemplate(@Body() data: any) {
        return this.notificationsService.createTemplate(data);
    }

    @Put('templates/:id')
    @ApiOperation({ summary: 'Update notification template' })
    updateTemplate(@Param('id') id: string, @Body() data: any) {
        return this.notificationsService.updateTemplate(id, data);
    }

    @Delete('templates/:id')
    @ApiOperation({ summary: 'Delete notification template' })
    deleteTemplate(@Param('id') id: string) {
        return this.notificationsService.deleteTemplate(id);
    }

    // ============================================
    // LOGS (Admin only)
    // ============================================
    @Get('logs')
    @ApiOperation({ summary: 'Get notification logs' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getLogs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.notificationsService.getLogs(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 50,
        );
    }
}
