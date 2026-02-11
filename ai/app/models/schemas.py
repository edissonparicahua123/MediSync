from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class TriageInput(BaseModel):
    symptoms: str = Field(..., description="Descripción de los síntomas del paciente")
    age: int = Field(..., ge=0, le=150, description="Edad del paciente")
    vitalSigns: Optional[Dict] = Field(default={}, description="Datos de signos vitales")
    medicalHistory: Optional[List[str]] = Field(default=[], description="Historial médico")


class TriageOutput(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Puntaje de triaje (0-100)")
    priority: str = Field(..., description="Nivel de prioridad: BAJA, NORMAL, ALTA, URGENTE")
    notes: str = Field(..., description="Notas de triaje y recomendaciones")
    confidence: float = Field(..., ge=0, le=1, description="Confianza de la predicción")


class SummarizationInput(BaseModel):
    text: str = Field(..., description="Texto clínico a resumir")
    max_length: Optional[int] = Field(default=200, description="Longitud máxima del resumen")


class SummarizationOutput(BaseModel):
    summary: str = Field(..., description="Texto resumido")
    original_length: int = Field(..., description="Longitud del texto original")
    summary_length: int = Field(..., description="Longitud del resumen")


class PharmacyDemandInput(BaseModel):
    medication_id: str = Field(..., description="ID del medicamento")
    historical_data: Optional[List[int]] = Field(default=[], description="Datos históricos de uso")
    days_ahead: Optional[int] = Field(default=30, description="Días a predecir a futuro")


class PharmacyDemandOutput(BaseModel):
    medication_id: str
    predicted_demand: int = Field(..., description="Cantidad de demanda predicha")
    confidence: float = Field(..., ge=0, le=1)
    recommendation: str = Field(..., description="Recomendación de stock")


class TextGeneratorInput(BaseModel):
    template_type: str = Field(..., description="Tipo de texto médico: receta, referencia, alta")
    patient_data: Dict = Field(..., description="Datos del paciente para la generación")
    additional_notes: Optional[str] = Field(default="", description="Notas adicionales")


class TextGeneratorOutput(BaseModel):
    generated_text: str = Field(..., description="Texto médico generado")
    template_type: str


class ChatInput(BaseModel):
    message: str = Field(..., description="Mensaje del usuario al asistente médico IA")
    context: Optional[str] = Field(default="", description="Contexto adicional para la conversación")
    history: Optional[List[Dict]] = Field(default=[], description="Historial de chat")


class ChatOutput(BaseModel):
    response: str = Field(..., description="Respuesta del asistente IA")
    confidence: float = Field(default=0.85, ge=0, le=1, description="Confianza de la respuesta")
    suggestions: Optional[List[str]] = Field(default=[], description="Sugerencias de seguimiento")
    source: str = Field(default="groq", description="Fuente de la respuesta: 'groq' o 'local_fallback'")
    model: Optional[str] = Field(default=None, description="Nombre del modelo de IA específico utilizado")


class AnalyticsInput(BaseModel):
    financial_data: Dict = Field(..., description="Datos financieros históricos por mes")

