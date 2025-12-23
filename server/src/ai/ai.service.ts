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
    }): Promise<any> {
        // Bypass external AI service for stability if it's not running
        // directly calls fallback logic.
        this.logger.log('Bypassing external AI service, using fallback rules.');
        return this.fallbackTriage(data);
        /* 
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
        */
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

    private fallbackTriage(data: any): any {
        const symptoms = data.symptoms.toLowerCase();

        let result = {
            priority: 4, // Default: NO URGENTE
            waitTime: 60,
            recommendations: ['Seguimiento ambulatorio', 'Control de síntomas']
        };

        if (symptoms.includes('pecho') || symptoms.includes('toracico') || symptoms.includes('respirar') || symptoms.includes('inconsciente')) {
            result = {
                priority: 1, // CRÍTICO
                waitTime: 0,
                recommendations: [
                    'Monitorear signos vitales cada 15 minutos',
                    'Preparar acceso IV inmediato',
                    'Alertar al equipo de reanimación',
                    'EKG de 12 derivaciones ahora'
                ]
            };
        } else if (symptoms.includes('sangre') || symptoms.includes('fractura') || symptoms.includes('quemadura') || symptoms.includes('fuerte') || symptoms.includes('intenso')) {
            result = {
                priority: 2, // URGENTE
                waitTime: 10,
                recommendations: [
                    'Controlar dolor',
                    'Inmovilización de zona afectada',
                    'Radiografías urgentes',
                    'Limpieza de heridas'
                ]
            };
        } else if (symptoms.includes('fiebre') || symptoms.includes('vomito') || symptoms.includes('dolor') || symptoms.includes('mareo')) {
            result = {
                priority: 3, // SEMI-URGENTE
                waitTime: 30,
                recommendations: [
                    'Hidratación oral o IV',
                    'Control térmico físico/químico',
                    'Observación por 2 horas',
                    'Exámenes de laboratorio básicos'
                ]
            };
        } else if (symptoms.includes('gripa') || symptoms.includes('tos') || symptoms.includes('garganta')) {
            result = {
                priority: 5, // BAJA PRIORIDAD
                waitTime: 120,
                recommendations: [
                    'Tratamiento sintomático',
                    'Reposo en casa',
                    'Control por consulta externa'
                ]
            };
        }

        return result;
    }
}
