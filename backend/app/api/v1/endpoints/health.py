from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db

router = APIRouter()


@router.get("/health", summary="Health Check")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }


@router.get("/health/db", summary="Database Diagnostics")
def health_db(db: Session = Depends(get_db)):
    try:
        res = db.execute(text("SELECT version();")).fetchone()
        user_count = db.execute(text("SELECT COUNT(*) FROM users;")).scalar()
        return {
            "status": "connected",
            "database_version": res[0] if res else "unknown",
            "users_count": user_count,
            "database_url_type": "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite"
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "database_url_type": "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite",
            "traceback": traceback.format_exc()
        }

