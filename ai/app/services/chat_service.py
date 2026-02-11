from app.models.schemas import ChatInput, ChatOutput
from typing import List, Dict
import re
from app.services.groq_service import GroqService

class ChatService:
    """
    Asistente Médico Virtual de EdiCarex.
    Provee respuestas inteligentes y orientación médica bajo la identidad EdiCarex.
    """

    def __init__(self):
        self.groq_service = GroqService()
        
        # Respuestas generales EdiCarex
        self.general_responses = {
            "saludo": "¡Hola! Soy EdiCarex AI, tu asistente médico inteligente. Estoy aquí para orientarte en temas de salud. ¿Cómo puedo ayudarte hoy?",
            "despedida": "Gracias por confiar en EdiCarex. Recuerda que esta información es orientativa. ¡Cuídate mucho!",
            "emergencia": "⚠️ ATENCIÓN: Si experimentas una emergencia, contacta de inmediato al 911 o acude al centro de salud más cercano. La seguridad es nuestra prioridad en EdiCarex.",
            "cita": "En EdiCarex facilitamos tu acceso a la salud. Puedes agendar una cita en la sección de 'Citas' del menú.",
        }

        self.knowledge_base = {
            "fiebre": {
                "causes": ["Infecciones", "Inflamación"],
                "recommendations": ["Hidratación", "Reposo", "Monitoreo de temperatura"],
            },
            # ... más base de conocimiento ...
        }

    async def chat(self, data: ChatInput) -> ChatOutput:
        """
        Procesa consultas utilizando el ecosistema híbrido EdiCarex.
        Prioriza Groq LPU, con fallback a redes neuronales locales y heurística.
        """
        message = data.message.lower().strip()
        
        # 1. Filtro de Seguridad Senior (Prioridad Absoluta)
        if any(word in message for word in ["emergencia", "urgente", "suicidio", "morir", "infarto"]):
            return ChatOutput(
                response=(
                    "### 🚨 PROTOCOLO DE EMERGENCIA EDICAREX ACTIVADO\n\n"
                    "Detectamos palabras clave de alta severidad. **Por favor, siga estas instrucciones de inmediato:**\n\n"
                    "1. **Llame al 911** o a su servicio local de emergencias.\n"
                    "2. **No intente conducir** usted mismo al hospital.\n"
                    "3. Mantenga la calma y espere la asistencia médica.\n\n"
                    "*Este sistema de IA no sustituye la atención médica de urgencia.*"
                ),
                confidence=1.0,
                suggestions=["Llamar a Emergencias", "Ver ubicación del Hospital", "Protocolo de Primeros Auxilios"],
                source="security_filter",
                model="EdiCarex Guardian"
            )

        # 2. Cerebro Central: Groq LPU (Llama 3.3 70B)
        # GroqService ya maneja sus propios reintentos y fallback interno a Mixtral/Llama 8B
        groq_response = await self.groq_service.generate_response(data.message)
        if groq_response and "Local Fallback" not in groq_response.model:
            return groq_response
        
        # 3. Fallback Estructural: Conocimiento Clínico Estático de EdiCarex
        # Si Groq falla o devuelve el fallback de emergencia, usamos nuestras plantillas profesionales.
        return self._get_professional_local_response(message)

    def _get_professional_local_response(self, message: str) -> ChatOutput:
        """
        Genera una respuesta clara y amable basada en reglas de apoyo EdiCarex.
        """
        if any(word in message for word in ["hola", "buenos dias", "quien eres"]):
            return ChatOutput(
                response=(
                    "¡Hola! Soy tu asistente de EdiCarex. 👋\n\n"
                    "Estoy aquí para ayudarte a navegar el hospital, orientarte sobre síntomas o agendar tus citas. "
                    "Incluso en este modo optimizado, mi prioridad es tu bienestar.\n\n"
                    "¿En qué te puedo ayudar hoy?"
                ),
                confidence=0.99,
                suggestions=["Consultar un síntoma", "Agendar cita", "Ver especialistas"],
                source="local_expert",
                model="EdiCarex Knowledge Core"
            )

        if "fiebre" in message:
            return ChatOutput(
                response=(
                    "Entiendo que tienes fiebre. Aquí tienes algunas recomendaciones generales de EdiCarex mientras contactas a un médico:\n\n"
                    "- **Hidrátate bien:** Bebe mucha agua o sueros.\n"
                    "- **Descansa:** Deja que tu cuerpo recupere energías.\n"
                    "- **Controla tu temperatura:** Hazlo cada pocas horas.\n\n"
                    "Si la fiebre es muy alta o no baja, por favor pide una cita pronto."
                ),
                confidence=0.95,
                suggestions=["Pedir Cita", "Síntomas de alarma", "Medicamentos básicos"],
                source="clinical_rules",
                model="EdiCarex Protocol"
            )

        # Respuesta Genérica Amigable
        return ChatOutput(
            response=(
                "Te escucho. Para poder darte una mejor orientación desde EdiCarex, ¿podrías contarme un poquito más sobre lo que sientes o lo que necesitas?\n\n"
                "Puedo ayudarte con dudas sobre síntomas, preparación para análisis o información del hospital."
            ),
            confidence=0.80,
            suggestions=["Ver Especialidades", "Ayuda con síntomas", "Soporte"],
            source="local_fallback",
            model="EdiCarex Assistant"
        )
