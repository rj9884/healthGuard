from fastapi import APIRouter

from app.api.v1.endpoints import analysis, auth, chat, dashboard, image, medications, symptoms

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(symptoms.router, prefix="/symptoms", tags=["Symptoms"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(medications.router, prefix="/medications", tags=["Medications"])
api_router.include_router(image.router, prefix="/image", tags=["Image Analysis"])
