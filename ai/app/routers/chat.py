from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatInput, ChatOutput
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("/chat", response_model=ChatOutput)
async def medical_chat(data: ChatInput):
    """
    Endpoint del Chat Médico IA.
    
    Procesa mensajes del usuario y retorna respuestas médicas inteligentes.
    
    Retorna:
        - response: Respuesta del asistente IA
        - confidence: Nivel de confianza de la respuesta
        - suggestions: Sugerencias de seguimiento
    """
    try:
        result = await chat_service.chat(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el chat: {str(e)}")
