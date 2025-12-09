import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all doctors' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.doctorsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get doctor by ID' })
    findOne(@Param('id') id: string) {
        return this.doctorsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create doctor' })
    create(@Body() data: any) {
        return this.doctorsService.create(data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update doctor' })
    update(@Param('id') id: string, @Body() data: any) {
        return this.doctorsService.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete doctor' })
    remove(@Param('id') id: string) {
        return this.doctorsService.remove(id);
    }
}
