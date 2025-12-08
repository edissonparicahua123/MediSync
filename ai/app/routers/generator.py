from fastapi import APIRouter, HTTPException
from app.models.schemas import TextGeneratorInput, TextGeneratorOutput
from app.services.generator_service import GeneratorService

router = APIRouter()
generator_service = GeneratorService()


@router.post("/text", response_model=TextGeneratorOutput)
async def generate_text(data: TextGeneratorInput):
    """
    Generate medical text documents (prescriptions, referrals, discharge summaries).
    
    Returns:
        - generated_text: Generated medical document
        - template_type: Type of document generated
    """
    try:
        result = generator_service.generate(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text generation failed: {str(e)}")
