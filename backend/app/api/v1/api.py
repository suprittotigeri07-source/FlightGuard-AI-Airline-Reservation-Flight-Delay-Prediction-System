from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, flights, reservations, operations, admin

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(flights.router, tags=["Flights & Search"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["Reservations"])
api_router.include_router(operations.router, prefix="/operations", tags=["Operations Dashboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
