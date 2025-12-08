import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateConfigDto, UpdateConfigDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('config')
    @ApiOperation({ summary: 'Create system configuration' })
    createConfig(@Body() createConfigDto: CreateConfigDto) {
        return this.adminService.createConfig(createConfigDto);
    }

    @Get('config')
    @ApiOperation({ summary: 'Get all configurations' })
    @ApiQuery({ name: 'category', required: false })
    getAllConfigs(@Query('category') category?: string) {
        return this.adminService.getAllConfigs(category);
    }

    @Get('config/:id')
    @ApiOperation({ summary: 'Get configuration by ID' })
    getConfigById(@Param('id') id: string) {
        return this.adminService.getConfigById(id);
    }

    @Put('config/:id')
    @ApiOperation({ summary: 'Update configuration' })
    updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
        return this.adminService.updateConfig(id, updateConfigDto);
    }

    @Delete('config/:id')
    @ApiOperation({ summary: 'Delete configuration' })
    deleteConfig(@Param('id') id: string) {
        return this.adminService.deleteConfig(id);
    }

    @Get('services/by-category')
    @ApiOperation({ summary: 'Get services grouped by category' })
    getServicesByCategory() {
        return this.adminService.getServicesByCategory();
    }
}
