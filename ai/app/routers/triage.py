from fastapi import APIRouter, HTTPException
from app.models.schemas import TriageInput, TriageOutput
from app.services.triage_service import TriageService

router = APIRouter()
triage_service = TriageService()


@router.post("/triage", response_model=TriageOutput)
async def predict_triage(data: TriageInput):
    """
    Predicción de triaje impulsada por IA basada en síntomas, signos vitales y datos del paciente.
    
    Retorna:
        - score: Puntaje de triaje (0-100)
        - priority: BAJA, NORMAL, ALTA o URGENTE
        - notes: Notas detalladas de triaje
        - confidence: Confianza de la predicción (0-1)
    """
    try:
        result = await triage_service.predict(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la predicción de triaje: {str(e)}")
