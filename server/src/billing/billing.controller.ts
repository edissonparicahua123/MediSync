import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@UseInterceptors(AuditInterceptor)
@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('invoices')
    @ApiOperation({ summary: 'Get all invoices' })
    async getInvoices(@Query() query: any) {
        return this.billingService.getInvoices(query);
    }

    @Get('invoices/:id')
    @ApiOperation({ summary: 'Get invoice by ID' })
    async getInvoice(@Param('id') id: string) {
        return this.billingService.getInvoice(id);
    }

    @Post('invoices')
    @ApiOperation({ summary: 'Create invoice' })
    async createInvoice(@Body() data: any) {
        return this.billingService.createInvoice(data);
    }

    @Patch('invoices/:id')
    @ApiOperation({ summary: 'Update invoice' })
    async updateInvoice(@Param('id') id: string, @Body() data: any) {
        return this.billingService.updateInvoice(id, data);
    }

    @Patch('invoices/:id/status')
    @ApiOperation({ summary: 'Update invoice status' })
    async updateStatus(@Param('id') id: string, @Body() data: any) {
        return this.billingService.updateStatus(id, data);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get billing statistics' })
    async getStats() {
        return this.billingService.getStats();
    }
}
