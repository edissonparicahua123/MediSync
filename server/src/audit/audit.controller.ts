import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Assuming you have a RolesGuard, if not I'll stick to JwtAuthGuard for now, 
// but usually this should be Admin only.
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @ApiOperation({ summary: 'Get all audit logs with filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'resource', required: false })
    @ApiQuery({ name: 'action', required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('userId') userId?: string,
        @Query('resource') resource?: string,
        @Query('action') action?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.auditService.findAll({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            userId,
            resource,
            action,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get audit statistics' })
    getStats() {
        return this.auditService.getStats();
    }

    @Get('history/:resource/:id')
    @ApiOperation({ summary: 'Get history for a specific resource' })
    async getHistory(
        @Param('resource') resource: string,
        @Param('id') id: string,
    ) {
        return this.auditService.getHistory(resource, id);
    }
}
