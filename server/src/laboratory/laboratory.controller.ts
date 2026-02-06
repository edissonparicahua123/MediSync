import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Laboratory')
@Controller('laboratory')
export class LaboratoryController {
    constructor(private readonly laboratoryService: LaboratoryService) { }

    @Get('orders')
    @ApiOperation({ summary: 'Get all lab orders' })
    async getOrders(@Query() query: any) {
        return this.laboratoryService.getOrders(query);
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get lab order by ID' })
    async getOrder(@Param('id') id: string) {
        return this.laboratoryService.getOrder(id);
    }

    @Post('orders')
    @ApiOperation({ summary: 'Create lab order' })
    async createOrder(@Body() data: any) {
        return this.laboratoryService.createOrder(data);
    }

    @Patch('orders/:id')
    @ApiOperation({ summary: 'Update lab order' })
    async updateOrder(@Param('id') id: string, @Body() data: any) {
        return this.laboratoryService.updateOrder(id, data);
    }

    @Patch('orders/:id/status')
    @ApiOperation({ summary: 'Update order status' })
    async updateStatus(@Param('id') id: string, @Body() data: any) {
        return this.laboratoryService.updateStatus(id, data);
    }

    @Delete('orders/:id')
    @ApiOperation({ summary: 'Delete lab order' })
    async deleteOrder(@Param('id') id: string) {
        return this.laboratoryService.deleteOrder(id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get laboratory statistics' })
    async getStats() {
        return this.laboratoryService.getStats();
    }

    @Get('tests')
    @ApiOperation({ summary: 'Get available tests' })
    async getTests() {
        return this.laboratoryService.getTests();
    }
}
