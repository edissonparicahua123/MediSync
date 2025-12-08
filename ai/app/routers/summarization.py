from fastapi import APIRouter, HTTPException
from app.models.schemas import SummarizationInput, SummarizationOutput
from app.services.summarization_service import SummarizationService

router = APIRouter()
summarization_service = SummarizationService()


@router.post("/summarize", response_model=SummarizationOutput)
async def summarize_text(data: SummarizationInput):
    """
    Summarize clinical notes and medical records.
    
    Returns:
        - summary: Summarized text
        - original_length: Length of original text
        - summary_length: Length of summary
    """
    try:
        result = summarization_service.summarize(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
