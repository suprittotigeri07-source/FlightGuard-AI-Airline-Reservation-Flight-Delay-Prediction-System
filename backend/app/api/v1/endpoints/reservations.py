from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    PaginatedReservationResponse
)
from app.services.reservation_service import ReservationService
from app.api.v1.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED, summary="Create Reservation")
def create_reservation(
    payload: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservationService(db)
    return service.create_reservation(current_user, payload)


@router.get("", response_model=PaginatedReservationResponse, summary="Get Current User's Reservations")
def get_my_reservations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservationService(db)
    return service.get_my_reservations(current_user, page=page, limit=limit)


@router.get("/{pnr}", response_model=ReservationResponse, summary="Get Reservation by PNR")
def get_reservation_by_pnr(
    pnr: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservationService(db)
    return service.get_reservation_by_pnr(current_user, pnr)


@router.post("/{id}/cancel", response_model=ReservationResponse, summary="Cancel Reservation")
def cancel_reservation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservationService(db)
    return service.cancel_reservation(current_user, id)
