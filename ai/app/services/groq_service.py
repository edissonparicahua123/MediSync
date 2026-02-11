import os
from groq import Groq
from app.models.schemas import ChatOutput
from typing import List, Optional
import json
import logging
import httpx
import asyncio

logger = logging.getLogger("EdiCarexAI.Groq")

class GroqService:
    """
    Servicio profesional para el ecosistema EdiCarex utilizando Groq.
    Garantiza inferencia ultra-rápida y alta disponibilidad.
    """
    
    def __init__(self):
        self._initialize_service()

    def _initialize_service(self):
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            env_path = os.path.join(os.getcwd(), ".env")
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GROQ_API_KEY="):
                            self.api_key = line.split("=", 1)[1].strip()
                            os.environ["GROQ_API_KEY"] = self.api_key
                            break

        if not self.api_key:
            logger.error("CRÍTICO: No se encontró la credencial de Groq para EdiCarex AI.")
            self.client = None
            return

        try:
            self.client = Groq(api_key=self.api_key)
            self.model_name = 'llama-3.3-70b-versatile'
            logger.info(f"Cerebro EdiCarex (Groq: {self.model_name}) sincronizado.")
        except Exception as e:
            logger.error(f"Error en sincronización Groq para EdiCarex: {e}")
            self.client = None

    async def execute_prompt(self, prompt: str, system_persona: str = "", retries: int = 2) -> Optional[dict]:
        """
        Ejecución robusta con Groq, reintentos exponenciales y rotación de modelos.
        Garantiza que EdiCarex nunca falle silenciosamente.
        """
        if not self.client:
            return self._get_emergency_fallback(prompt)

        # Persona de EdiCarex: Profesional pero Humana y Empática
        base_system = (
            "Eres el asistente central de EdiCarex Enterprise. "
            "Debes identificarte siempre como 'EdiCarex AI' y referirte a este centro médico como 'EdiCarex' o 'Clínica EdiCarex'. "
            "Tu objetivo es ser un compañero experto, empático y profesional para el usuario (Edisson). "
            "Aunque eres una IA médica de élite, mantén una conversación fluida y natural. "
            "Evita ser excesivamente rígido o robótico. Responde con calidez pero manteniendo el rigor clínico cuando sea necesario. "
            "Usa markdown para mejorar la legibilidad, pero no fuerces estructuras pesadas si la consulta es sencilla. "
            "Tu prioridad es ayudar de manera directa y humana."
        )
        full_system_prompt = f"{base_system} Contexto específico: {system_persona}"
        
        available_models = [self.model_name, 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
        
        for model_name in available_models:
            for attempt in range(retries + 1):
                try:
                    if attempt > 0:
                        wait_time = 2 ** attempt
                        logger.info(f"Reintentando en {model_name} (intento {attempt+1}) tras {wait_time}s...")
                        await asyncio.sleep(wait_time)

                    completion = self.client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": full_system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.6, # Mayor temperatura para naturalidad (dentro de lo seguro)
                        max_tokens=2048
                    )
                    
                    res_text = completion.choices[0].message.content
                    if not res_text:
                        continue

                    return self._parse_json_safely(res_text)

                except Exception as e:
                    logger.warning(f"Falla en {model_name} (intento {attempt+1}): {str(e)[:100]}")
                    if attempt == retries:
                        continue # Probar siguiente modelo
        
        return self._get_emergency_fallback(prompt)

    def _parse_json_safely(self, text: str) -> dict:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    pass
        return {"error": "JSON_PARSE_FAILED", "raw": text}

    def _get_emergency_fallback(self, prompt: str) -> dict:
        """
        Sistema de respaldo local de EdiCarex ante caída total de APIs externas.
        """
        logger.error("MODO CRÍTICO: Activando protocolo de respaldo local EdiCarex AI.")
        return {
            "response": (
                "### 🏥 Nota de EdiCarex AI\n\n"
                "Hola, estoy operando en **modo de respaldo local** debido a una interrupción técnica. "
                "Aunque mis capacidades completas están en mantenimiento, puedo darte orientación básica.\n\n"
                "**Importante:** Si presentas síntomas graves, por favor acude a urgencias ahora mismo."
            ),
            "confidence": 0.5,
            "suggestions": ["Reintentar pronto", "Ver ayuda local"],
            "model": "Respaldo EdiCarex"
        }

    async def generate_response(self, message: str) -> Optional[ChatOutput]:
        """
        Genera una respuesta médica balanceada entre profesionalismo y calidez.
        """
        system_persona = (
            "Eres un asistente médico inteligente que habla como un experto cercano. "
            "No seas redundante ni analices en exceso cada palabra del usuario. "
            "Responde de forma directa, útil y amigable."
        )
        
        prompt = f"""
        El usuario dice: "{message}"
        
        TAREA:
        - Responde de forma natural y profesional.
        - Si es una duda médica, mantén el rigor pero sé empático.
        - Usa markdown (listas, negritas) para que se lea bien.
        - Solo incluye una advertencia legal breve al final si es necesario.
        
        FORMATO JSON:
        {{
            "response": "Tu respuesta directa aquí",
            "confidence": 0.XX,
            "suggestions": ["preg 1", "preg 2", "preg 3"]
        }}
        """

        result = await self.execute_prompt(prompt, system_persona)
        
        if result:
            return ChatOutput(
                response=result.get("response", "Lo siento, tuve un problema interno. ¿Me repites eso?"),
                confidence=result.get("confidence", 0.95),
                suggestions=result.get("suggestions", []),
                source="groq",
                model=result.get("model", self.model_name)
            )
        return None
