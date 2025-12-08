from fastapi import APIRouter, HTTPException
from app.models.schemas import PharmacyDemandInput, PharmacyDemandOutput
from app.services.pharmacy_service import PharmacyService

router = APIRouter()
pharmacy_service = PharmacyService()


@router.post("/demand", response_model=PharmacyDemandOutput)
async def predict_demand(data: PharmacyDemandInput):
    """
    Predict pharmacy medication demand using time series forecasting.
    
    Returns:
        - medication_id: ID of the medication
        - predicted_demand: Predicted quantity needed
        - confidence: Prediction confidence
        - recommendation: Stock management recommendation
    """
    try:
        result = pharmacy_service.predict_demand(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand prediction failed: {str(e)}")
