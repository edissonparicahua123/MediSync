import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HRService } from './hr.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@ApiTags('HR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@UseInterceptors(AuditInterceptor)
@Controller('hr')
export class HRController {
    constructor(private readonly hrService: HRService) { }

    @Post('employees')
    @ApiOperation({ summary: 'Create new employee' })
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.hrService.create(createEmployeeDto);
    }

    @Get('employees')
    @ApiOperation({ summary: 'Get all employees' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'department', required: false })
    @ApiQuery({ name: 'role', required: false })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('department') department?: string,
        @Query('role') role?: string,
    ) {
        return this.hrService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
            department,
            role,
        );
    }

    @Get('employees/:id')
    @ApiOperation({ summary: 'Get employee by ID' })
    findOne(@Param('id') id: string) {
        return this.hrService.findOne(id);
    }

    @Put('employees/:id')
    @ApiOperation({ summary: 'Update employee' })
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.hrService.update(id, updateEmployeeDto);
    }

    @Delete('employees/:id')
    @ApiOperation({ summary: 'Delete employee' })
    remove(@Param('id') id: string) {
        return this.hrService.remove(id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get HR statistics' })
    getStats() {
        return this.hrService.getStats();
    }

    @Get('attendance')
    @ApiOperation({ summary: 'Get employee attendance' })
    getAttendance(@Query('date') date?: string) {
        return this.hrService.getAttendance(date ? new Date(date) : undefined);
    }

    @Get('payroll')
    @ApiOperation({ summary: 'Get payroll records' })
    getPayroll() {
        return this.hrService.getPayroll();
    }

    @Get('shifts')
    @ApiOperation({ summary: 'Get employee shifts' })
    getShifts() {
        return this.hrService.getShifts();
    }

    @Post('shifts')
    @ApiOperation({ summary: 'Create new shift' })
    createShift(@Body() data: any) { // Using any for simplicity as DTO update had issues
        return this.hrService.createShift(data);
    }

    @Delete('shifts/:id')
    @ApiOperation({ summary: 'Delete shift' })
    deleteShift(@Param('id') id: string) {
        return this.hrService.deleteShift(id);
    }

    @Put('shifts/:id')
    @ApiOperation({ summary: 'Update shift' })
    updateShift(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateShift(id, data);
    }

    @Post('attendance')
    @ApiOperation({ summary: 'Create attendance record' })
    createAttendance(@Body() data: any) {
        return this.hrService.createAttendance(data);
    }

    @Post('payroll')
    @ApiOperation({ summary: 'Generate monthly payroll for all active employees' })
    generatePayroll() {
        return this.hrService.generatePayroll();
    }

    @Put('payroll/:id/pay')
    @ApiOperation({ summary: 'Mark payroll as paid' })
    payPayroll(@Param('id') id: string) {
        return this.hrService.payPayroll(id);
    }

    @Delete('payroll/:id')
    @ApiOperation({ summary: 'Delete payroll record' })
    deletePayroll(@Param('id') id: string) {
        return this.hrService.deletePayroll(id);
    }
}
