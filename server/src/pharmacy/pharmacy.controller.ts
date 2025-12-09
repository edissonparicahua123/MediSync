import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pharmacy')
@Controller('pharmacy')
export class PharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) { }

    @Get('medications')
    @ApiOperation({ summary: 'Get all medications' })
    async getMedications(@Query() query: any) {
        return this.pharmacyService.getMedications(query);
    }

    @Get('medications/:id')
    @ApiOperation({ summary: 'Get medication by ID' })
    async getMedication(@Param('id') id: string) {
        return this.pharmacyService.getMedication(id);
    }

    @Post('medications')
    @ApiOperation({ summary: 'Create medication' })
    async createMedication(@Body() data: any) {
        return this.pharmacyService.createMedication(data);
    }

    @Patch('medications/:id')
    @ApiOperation({ summary: 'Update medication' })
    async updateMedication(@Param('id') id: string, @Body() data: any) {
        return this.pharmacyService.updateMedication(id, data);
    }

    @Delete('medications/:id')
    @ApiOperation({ summary: 'Delete medication' })
    async deleteMedication(@Param('id') id: string) {
        return this.pharmacyService.deleteMedication(id);
    }

    @Get('stock')
    @ApiOperation({ summary: 'Get stock information' })
    async getStock(@Query() query: any) {
        return this.pharmacyService.getStock(query);
    }

    @Get('stock/low')
    @ApiOperation({ summary: 'Get low stock medications' })
    async getLowStock() {
        return this.pharmacyService.getLowStock();
    }

    @Patch('stock/:id')
    @ApiOperation({ summary: 'Update stock' })
    async updateStock(@Param('id') id: string, @Body() data: any) {
        return this.pharmacyService.updateStock(id, data);
    }
}
