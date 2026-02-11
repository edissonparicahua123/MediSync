import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('triage')
    @ApiOperation({ summary: 'AI-powered triage prediction' })
    predictTriage(@Body() data: any) {
        return this.aiService.predictTriage(data);
    }

    @Post('summarize')
    @ApiOperation({ summary: 'Summarize clinical notes' })
    summarize(@Body() data: { text: string }) {
        return this.aiService.summarizeClinical(data.text);
    }

    @Post('pharmacy/demand')
    @ApiOperation({ summary: 'Predict pharmacy demand' })
    predictDemand(@Body() data: { medication_id: string }) {
        return this.aiService.predictPharmacyDemand(data.medication_id);
    }

    @Post('chat')
    @ApiOperation({ summary: 'Medical AI Chat' })
    chat(@Body() data: { message: string; context?: string }) {
        return this.aiService.chat(data);
    }
}
