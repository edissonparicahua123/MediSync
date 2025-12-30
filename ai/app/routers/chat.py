from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatInput, ChatOutput
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("/chat", response_model=ChatOutput)
async def medical_chat(data: ChatInput):
    """
    Medical AI Chat endpoint.
    
    Processes user messages and returns intelligent medical responses.
    
    Returns:
        - response: AI assistant response
        - confidence: Response confidence level
        - suggestions: Follow-up suggestions
    """
    try:
        result = await chat_service.chat(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
