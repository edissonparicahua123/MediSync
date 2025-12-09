import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Billing')
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
