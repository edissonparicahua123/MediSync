from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class TriageInput(BaseModel):
    symptoms: str = Field(..., description="Patient symptoms description")
    age: int = Field(..., ge=0, le=150, description="Patient age")
    vitalSigns: Optional[Dict] = Field(default={}, description="Vital signs data")
    medicalHistory: Optional[List[str]] = Field(default=[], description="Medical history")


class TriageOutput(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Triage score (0-100)")
    priority: str = Field(..., description="Priority level: LOW, NORMAL, HIGH, URGENT")
    notes: str = Field(..., description="Triage notes and recommendations")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")


class SummarizationInput(BaseModel):
    text: str = Field(..., description="Clinical text to summarize")
    max_length: Optional[int] = Field(default=200, description="Maximum summary length")


class SummarizationOutput(BaseModel):
    summary: str = Field(..., description="Summarized text")
    original_length: int = Field(..., description="Original text length")
    summary_length: int = Field(..., description="Summary length")


class PharmacyDemandInput(BaseModel):
    medication_id: str = Field(..., description="Medication ID")
    historical_data: Optional[List[int]] = Field(default=[], description="Historical usage data")
    days_ahead: Optional[int] = Field(default=30, description="Days to predict ahead")


class PharmacyDemandOutput(BaseModel):
    medication_id: str
    predicted_demand: int = Field(..., description="Predicted demand quantity")
    confidence: float = Field(..., ge=0, le=1)
    recommendation: str = Field(..., description="Stock recommendation")


class TextGeneratorInput(BaseModel):
    template_type: str = Field(..., description="Type of medical text: prescription, referral, discharge")
    patient_data: Dict = Field(..., description="Patient data for generation")
    additional_notes: Optional[str] = Field(default="", description="Additional notes")


class TextGeneratorOutput(BaseModel):
    generated_text: str = Field(..., description="Generated medical text")
    template_type: str
