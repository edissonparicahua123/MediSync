from fastapi import APIRouter, HTTPException
from app.models.schemas import TriageInput, TriageOutput
from app.services.triage_service import TriageService

router = APIRouter()
triage_service = TriageService()


@router.post("/triage", response_model=TriageOutput)
async def predict_triage(data: TriageInput):
    """
    AI-powered triage prediction based on symptoms, vital signs, and patient data.
    
    Returns:
        - score: Triage score (0-100)
        - priority: LOW, NORMAL, HIGH, or URGENT
        - notes: Detailed triage notes
        - confidence: Prediction confidence (0-1)
    """
    try:
        result = triage_service.predict(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage prediction failed: {str(e)}")
