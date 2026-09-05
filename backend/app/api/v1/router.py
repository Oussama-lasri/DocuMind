from fastapi import APIRouter

from app.api.v1.endpoints import authentication, chat, document

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(document.router, prefix="/documents", tags=["Documents"])
api_router.include_router(authentication.router, prefix="/auth", tags=["Authentication"])