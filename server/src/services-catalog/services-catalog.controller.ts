import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServicesCatalogService } from './services-catalog.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Services Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@Controller('services-catalog')
export class ServicesCatalogController {
    constructor(private readonly servicesCatalogService: ServicesCatalogService) { }

    @Get()
    @ApiOperation({ summary: 'Get all active services' })
    async getAll(@Query() query: any) {
        return this.servicesCatalogService.getAll(query);
    }

    @Get('seed')
    @ApiOperation({ summary: 'Seed initial catalog data' })
    async seed() {
        return this.servicesCatalogService.seed();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get service by ID' })
    async getById(@Param('id') id: string) {
        return this.servicesCatalogService.getById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new service' })
    async create(@Body() data: any) {
        return this.servicesCatalogService.create(data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update service' })
    async update(@Param('id') id: string, @Body() data: any) {
        return this.servicesCatalogService.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete service (soft delete)' })
    async delete(@Param('id') id: string) {
        return this.servicesCatalogService.delete(id);
    }
}
