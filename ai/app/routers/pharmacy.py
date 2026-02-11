from fastapi import APIRouter, HTTPException
from app.models.schemas import PharmacyDemandInput, PharmacyDemandOutput
from app.services.pharmacy_service import PharmacyService

router = APIRouter()
pharmacy_service = PharmacyService()


@router.post("/demand", response_model=PharmacyDemandOutput)
async def predict_demand(data: PharmacyDemandInput):
    """
    Predecir la demanda de medicamentos de la farmacia utilizando pronósticos de series temporales.
    
    Retorna:
        - medication_id: ID del medicamento
        - predicted_demand: Cantidad predicha necesaria
        - confidence: Confianza de la predicción
        - recommendation: Recomendación de gestión de stock
    """
    try:
        result = await pharmacy_service.predict_demand(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la predicción de demanda: {str(e)}")
