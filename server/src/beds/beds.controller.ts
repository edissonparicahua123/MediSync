import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BedsService } from './beds.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('beds')
@Controller('beds')
export class BedsController {
    constructor(private readonly bedsService: BedsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new bed' })
    create(@Body() createBedDto: any) {
        return this.bedsService.create(createBedDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all beds' })
    findAll(@Query() query: any) {
        return this.bedsService.findAll(query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get bed statistics' })
    getStats() {
        return this.bedsService.getStats();
    }

    @Get('activities')
    @ApiOperation({ summary: 'Get global bed activity logs' })
    getActivities() {
        return this.bedsService.findAllActivities();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a bed by id' })
    findOne(@Param('id') id: string) {
        return this.bedsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a bed' })
    update(@Param('id') id: string, @Body() updateBedDto: any) {
        return this.bedsService.update(id, updateBedDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a bed' })
    remove(@Param('id') id: string) {
        return this.bedsService.remove(id);
    }

    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign a patient to a bed' })
    assign(@Param('id') id: string, @Body() data: any) {
        return this.bedsService.assignPatient(id, data);
    }

    @Post(':id/discharge')
    @ApiOperation({ summary: 'Discharge a patient from a bed' })
    discharge(@Param('id') id: string) {
        return this.bedsService.dischargePatient(id);
    }
}
