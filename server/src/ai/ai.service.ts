import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly aiServiceUrl: string;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    }

    async predictTriage(data: {
        symptoms: string;
        age: number;
        vitalSigns: any;
    }): Promise<{ score: number; priority: string; notes: string }> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/predict/triage`, data),
            );
            return response.data as { score: number; priority: string; notes: string };
        } catch (error) {
            this.logger.error('AI triage prediction failed', error);
            // Fallback to rule-based triage
            return this.fallbackTriage(data);
        }
    }

    async summarizeClinical(text: string): Promise<{ summary: string }> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/summarize`, { text }),
            );
            return response.data as { summary: string };
        } catch (error) {
            this.logger.error('AI summarization failed', error);
            return { summary: text.substring(0, 200) + '...' };
        }
    }

    async predictPharmacyDemand(medicationId: string): Promise<{ predicted_demand: number }> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/pharmacy/demand`, { medication_id: medicationId }),
            );
            return response.data as { predicted_demand: number };
        } catch (error) {
            this.logger.error('AI demand prediction failed', error);
            return { predicted_demand: 100 };
        }
    }

    private fallbackTriage(data: any): { score: number; priority: string; notes: string } {
        const symptoms = data.symptoms.toLowerCase();

        // Simple rule-based triage
        if (symptoms.includes('chest pain') || symptoms.includes('difficulty breathing')) {
            return { score: 90, priority: 'URGENT', notes: 'Critical symptoms detected' };
        } else if (symptoms.includes('fever') || symptoms.includes('pain')) {
            return { score: 60, priority: 'HIGH', notes: 'Moderate symptoms' };
        } else {
            return { score: 30, priority: 'NORMAL', notes: 'Routine consultation' };
        }
    }
}
