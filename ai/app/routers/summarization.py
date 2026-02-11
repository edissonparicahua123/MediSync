from fastapi import APIRouter, HTTPException
from app.models.schemas import SummarizationInput, SummarizationOutput
from app.services.summarization_service import SummarizationService

router = APIRouter()
summarization_service = SummarizationService()


@router.post("/summarize", response_model=SummarizationOutput)
async def summarize_text(data: SummarizationInput):
    """
    Resumir notas clínicas y registros médicos.
    
    Retorna:
        - summary: Texto resumido
        - original_length: Longitud del texto original
        - summary_length: Longitud del resumen
    """
    try:
        result = await summarization_service.summarize(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en el resumen: {str(e)}")
