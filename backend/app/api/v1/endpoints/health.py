from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }
