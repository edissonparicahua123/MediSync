import os
import google.generativeai as genai
from app.models.schemas import ChatOutput
from typing import List, Optional
import json

class GeminiService:
    """
    Service to interact with Google Gemini API for medical assistance.
    """
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY not found in environment variables.")

    async def generate_response(self, message: str) -> Optional[ChatOutput]:
        """
        Generate a medical response using Gemini.
        Returns None if API is not configured or fails.
        """
        if not self.model:
            return None

        try:
            # Construct the prompt with strict medical guidelines
            prompt = f"""
            Actúa como un asistente médico virtual profesional y empático llamado "MediSync AI".
            
            Tu objetivo es brindar orientación médica general basada en los síntomas que describe el usuario.
            
            REGLAS ESTRICTAS:
            1. NO eres un médico. NO des diagnósticos definitivos.
            2. SIEMPRE usa un tono calmado, profesional y empático.
            3. SIEMPRE incluye una advertencia de que eres una IA y que el usuario debe consultar a un médico.
            4. Si los síntomas suenan graves (dolor de pecho, dificultad para respirar, sangrado intenso, inconsciencia), INDICA CLARAMENTE que deben acudir a urgencias de inmediato.
            5. Estructura tu respuesta en formato JSON con los siguientes campos:
               - "response": El texto de tu respuesta al usuario (usa markdown para listas o negritas).
               - "confidence": Un número entre 0.0 y 1.0 indicando tu confianza en la respuesta.
               - "suggestions": Una lista de 3 preguntas cortas o acciones sugeridas para el usuario.
            
            Mensaje del usuario: "{message}"
            
            Responde SOLO con el JSON válido.
            """

            response = await self.model.generate_content_async(prompt)
            
            # Parse the JSON response
            text_response = response.text
            # Clean up potential markdown code blocks if Gemini adds them
            text_response = text_response.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(text_response)
            
            return ChatOutput(
                response=data.get("response", "Lo siento, no pude generar una respuesta válida."),
                confidence=data.get("confidence", 0.8),
                suggestions=data.get("suggestions", [])
            )

        except Exception as e:
            print(f"Error generating Gemini response: {e}")
            return None
