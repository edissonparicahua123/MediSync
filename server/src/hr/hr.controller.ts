import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HRService } from './hr.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('HR')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
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
}
