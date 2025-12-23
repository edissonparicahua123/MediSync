import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new patient' })
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientsService.create(createPatientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all patients with search and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'query', required: false, type: String })
    @ApiQuery({ name: 'gender', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: String })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('query') query?: string,
        @Query('gender') gender?: string,
        @Query('status') status?: string,
    ) {
        const search: SearchPatientsDto = { query, gender, status };
        return this.patientsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get patient by ID with complete history' })
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id);
    }

    @Get(':id/medical-history')
    @ApiOperation({ summary: 'Get patient medical history' })
    getMedicalHistory(@Param('id') id: string) {
        return this.patientsService.getMedicalHistory(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update patient' })
    update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientsService.update(id, updatePatientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete patient (soft delete)' })
    remove(@Param('id') id: string) {
        return this.patientsService.remove(id);
    }
}
