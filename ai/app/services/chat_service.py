from app.models.schemas import ChatInput, ChatOutput
from typing import List, Dict
import re


from app.services.gemini_service import GeminiService

class ChatService:
    """
    Medical AI Chat Service.
    Provides intelligent responses to medical questions using NLP and knowledge base.
    """

    def __init__(self):
        self.gemini_service = GeminiService()
        # Medical knowledge base for common conditions
        self.knowledge_base = {
            "fiebre": {
                "causes": ["Infección viral", "Infección bacteriana", "Inflamación"],
                "recommendations": ["Hidratación abundante", "Antipiréticos si supera 38.5°C", "Reposo"],
                "when_urgent": "Si la fiebre supera 39.5°C o dura más de 3 días",
            },
            "dolor de cabeza": {
                "causes": ["Tensión muscular", "Migraña", "Deshidratación", "Estrés"],
                "recommendations": ["Descanso en lugar oscuro", "Hidratación", "Analgésicos de venta libre"],
                "when_urgent": "Si es súbito e intenso, o viene acompañado de rigidez de cuello",
            },
            "tos": {
                "causes": ["Resfriado común", "Alergia", "Irritación de garganta", "Asma"],
                "recommendations": ["Miel con limón", "Mantenerse hidratado", "Evitar irritantes"],
                "when_urgent": "Si hay sangre o dificultad para respirar",
            },
            "dolor de estómago": {
                "causes": ["Indigestión", "Gastritis", "Estrés", "Infección gastrointestinal"],
                "recommendations": ["Dieta blanda", "Evitar alimentos irritantes", "Hidratación"],
                "when_urgent": "Si es intenso o viene con fiebre alta o vómitos persistentes",
            },
            "dolor de pecho": {
                "causes": ["Muscular", "Ansiedad", "Problemas cardíacos", "Reflujo"],
                "recommendations": ["Descanso", "Evaluación médica inmediata", "Monitorear síntomas"],
                "when_urgent": "SIEMPRE - Dolor de pecho requiere evaluación médica urgente",
            },
            "mareo": {
                "causes": ["Deshidratación", "Presión arterial baja", "Vértigo", "Anemia"],
                "recommendations": ["Sentarse o acostarse", "Hidratarse", "Movimientos lentos"],
                "when_urgent": "Si es persistente o viene con otros síntomas neurológicos",
            },
        }

        # General medical responses
        self.general_responses = {
            "saludo": "¡Hola! Soy el Asistente Médico IA de MediSync. Estoy aquí para ayudarte con consultas médicas generales. ¿En qué puedo asistirte hoy?",
            "despedida": "Gracias por consultar. Recuerda que esta información es orientativa. Para un diagnóstico preciso, consulta siempre con un profesional de salud. ¡Cuídate!",
            "emergencia": "⚠️ Si estás experimentando una emergencia médica, por favor llama a servicios de emergencia (911) inmediatamente o acude al servicio de urgencias más cercano.",
            "cita": "Para agendar una cita médica, puedes ir a la sección de Citas en el menú principal o contactar a recepción.",
        }

    async def chat(self, data: ChatInput) -> ChatOutput:
        """
        Process user message and generate AI response.
        Tries Gemini first, falls back to local rules.
        """
        # Try Gemini first
        if self.gemini_service.model:
            gemini_response = await self.gemini_service.generate_response(data.message)
            if gemini_response:
                return gemini_response

        # Fallback to local rules
        message = data.message.lower().strip()
        suggestions = []

        # Check for greetings
        if any(word in message for word in ["hola", "buenos", "buenas", "hi", "hello", "qué tal", "que tal"]):
            return ChatOutput(
                response=self.general_responses["saludo"],
                confidence=0.95,
                suggestions=["¿Qué síntomas tienes?", "Agendar una cita", "Consultar sobre medicamentos"]
            )

        # Check for well-being questions
        if any(phrase in message for phrase in ["como estas", "cómo estás", "todo bien"]):
            return ChatOutput(
                response="¡Estoy funcionando al 100% y listo para ayudarte! Soy una inteligencia artificial diseñada para asistirte con temas de salud.",
                confidence=0.95,
                suggestions=["Tengo un dolor", "Quiero agendar cita"]
            )

        # Check for acknowledgment/affirmation
        if any(word in message for word in ["ok", "vale", "entendido", "listo", "bueno", "gracias", "perfecto"]):
            return ChatOutput(
                response="Me alegra poder ayudarte. ¿Tienes alguna otra consulta médica o sobre tus síntomas?",
                confidence=0.90,
                suggestions=["No, gracias", "Sí, tengo otra duda"]
            )

        # Check for farewell
        if any(word in message for word in ["adios", "chao", "bye", "hasta luego", "nos vemos"]):
            return ChatOutput(
                response=self.general_responses["despedida"],
                confidence=0.95,
                suggestions=[]
            )

        # Check for emergencies
        if any(word in message for word in ["emergencia", "urgente", "grave", "no puedo respirar", "inconsciente"]):
            return ChatOutput(
                response=self.general_responses["emergencia"],
                confidence=0.99,
                suggestions=["Llamar a emergencias", "Ver casos de emergencia"]
            )

        # Check for appointments
        if any(word in message for word in ["cita", "turno", "reservar", "agendar"]):
            return ChatOutput(
                response=self.general_responses["cita"],
                confidence=0.90,
                suggestions=["Ver citas disponibles", "Consultar horarios de doctores"]
            )

        # Search in knowledge base
        for condition, info in self.knowledge_base.items():
            if condition in message:
                response = self._generate_condition_response(condition, info)
                suggestions = [
                    f"¿Cuándo debo buscar atención urgente?",
                    f"¿Qué medicamentos puedo tomar?",
                    "Agendar cita con especialista"
                ]
                return ChatOutput(
                    response=response,
                    confidence=0.88,
                    suggestions=suggestions
                )

        # Generic medical response
        response = self._generate_generic_response(message)
        return ChatOutput(
            response=response,
            confidence=0.75,
            suggestions=["Describir síntomas específicos", "Agendar consulta médica", "Ver mi historial médico"]
        )

    def _generate_condition_response(self, condition: str, info: Dict) -> str:
        """Generate detailed response for known conditions."""
        causes = ", ".join(info["causes"][:3])
        recommendations = "\n• ".join(info["recommendations"])
        urgent = info["when_urgent"]

        return f"""Sobre **{condition.capitalize()}**:

**Posibles causas:** {causes}

**Recomendaciones:**
• {recommendations}

**⚠️ Buscar atención urgente:** {urgent}

Esta información es orientativa. Para un diagnóstico preciso, te recomiendo agendar una cita con un médico."""

    def _generate_generic_response(self, message: str) -> str:
        """Generate response for unrecognized queries."""
        # Check for symptom-related words
        symptom_words = ["dolor", "molestia", "ardor", "picazón", "hinchazón", "sangrado", "cansancio", "debilidad"]
        
        if any(word in message for word in symptom_words):
            return """Entiendo que presentas algunos síntomas. Para poder orientarte mejor, necesito más información:

1. ¿Desde cuándo presentas estos síntomas?
2. ¿En qué parte del cuerpo se localizan?
3. ¿Has tomado algún medicamento?
4. ¿Los síntomas han empeorado o mejorado?

Con esta información podré brindarte una orientación más precisa. Si los síntomas son severos, te recomiendo acudir a urgencias."""

        # General response
        return """Gracias por tu consulta. Como asistente médico IA, puedo ayudarte con:

• **Información sobre síntomas** - Describe qué sientes
• **Orientación general** - Recomendaciones básicas de salud
• **Agendar citas** - Te guío para reservar con un especialista
• **Información de medicamentos** - Consultas sobre tratamientos

¿En qué te puedo ayudar específicamente?"""
