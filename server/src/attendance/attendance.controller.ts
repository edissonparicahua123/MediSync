import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get current user attendance status' })
    getStatus(@Request() req: any) {
        return this.attendanceService.getStatus(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('clock-in')
    @ApiOperation({ summary: 'Clock In for current user' })
    clockIn(@Request() req: any) {
        return this.attendanceService.clockIn(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('clock-out')
    @ApiOperation({ summary: 'Clock Out for current user' })
    clockOut(@Request() req: any) {
        return this.attendanceService.clockOut(req.user.id);
    }

    @Post('kiosk')
    @ApiOperation({ summary: 'Clock In/Out via Document ID (Public Kiosk)' })
    kiosk(@Body() body: { documentId: string }) {
        return this.attendanceService.kioskClock(body.documentId);
    }

    @Get('kiosk-stats')
    @ApiOperation({ summary: 'Get daily stats for Public Kiosk' })
    getKioskStats() {
        return this.attendanceService.getKioskStats();
    }
}
