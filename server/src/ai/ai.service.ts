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
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/predict/triage`, data),
            );
            this.logger.log('AI triage prediction successful');
            return response.data;
        } catch (error) {
            this.logger.warn('AI service unavailable, using fallback rules');
            // Fallback to rule-based triage when AI service is not running
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

    async predictGrowth(financialData: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/analytics/predict/growth`, { financial_data: financialData }),
            );
            return response.data;
        } catch (error) {
            this.logger.error('AI growth prediction failed', error);
            return null;
        }
    }

    async chat(data: { message: string; context?: string }): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/ai/chat`, data),
            );
            this.logger.log('AI chat response successful');
            return response.data;
        } catch (error) {
            this.logger.warn('AI chat service unavailable, using fallback response');
            return this.fallbackChat(data.message);
        }
    }

    private fallbackChat(message: string): any {
        const messageLower = message.toLowerCase();
        let response = 'Gracias por tu consulta. Para una orientación más precisa, te recomiendo agendar una cita con un especialista.';

        if (messageLower.includes('fiebre')) {
            response = 'La fiebre puede tener múltiples causas. Te recomiendo: 1) Hidratación abundante, 2) Reposo, 3) Antipiréticos si supera 38.5°C. Si persiste más de 3 días, consulta con un médico.';
        } else if (messageLower.includes('dolor de cabeza') || messageLower.includes('cefalea')) {
            response = 'Para el dolor de cabeza: 1) Descansa en un lugar oscuro y silencioso, 2) Mantente hidratado, 3) Puedes tomar analgésicos de venta libre. Si es muy intenso o frecuente, consulta con un especialista.';
        } else if (messageLower.includes('tos')) {
            response = 'Para la tos: 1) Mantente bien hidratado, 2) Miel con limón puede aliviar, 3) Evita irritantes como humo. Si hay sangre o dificultad respiratoria, busca atención urgente.';
        } else if (messageLower.includes('dolor de pecho') || messageLower.includes('pecho')) {
            response = '⚠️ El dolor de pecho puede ser serio. Si es intenso, repentino o viene con dificultad para respirar, busca atención médica de emergencia inmediatamente.';
        } else if (messageLower.includes('hola') || messageLower.includes('buenos') || messageLower.includes('qué tal')) {
            response = '¡Hola! Soy EdiCarex AI, tu asistente médico inteligente. ¿En qué puedo ayudarte hoy? Puedes consultarme sobre síntomas, orientación médica general o información sobre citas.';
        } else if (messageLower.includes('como estas') || messageLower.includes('cómo estás')) {
            response = '¡Estoy funcionando correctamente y listo para ayudarte! Soy una inteligencia artificial diseñada para asistirte.';
        } else if (messageLower.includes('ok') || messageLower.includes('gracias') || messageLower.includes('entendido')) {
            response = 'Me alegra poder ayudarte. ¿Tienes alguna otra consulta médica?';
        }

        return {
            response,
            confidence: 0.75,
            suggestions: ['Agendar cita médica', 'Describir más síntomas', 'Ver historial médico']
        };
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
