import math
from typing import List
from sqlalchemy.orm import Session
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.flight_repository import FlightRepository
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    PaginatedReservationResponse,
    PassengerResponse
)
from app.services.flight_service import FlightService
from app.models.user import User
from app.core.exceptions import FlightGuardException


class ReservationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReservationRepository(db)
        self.flight_repo = FlightRepository(db)
        self.flight_service = FlightService(db)

    def _to_reservation_response(self, res) -> ReservationResponse:
        flight_resp = self.flight_service._to_flight_response(res.flight)
        passengers_resp = [PassengerResponse.model_validate(p) for p in res.passengers]

        return ReservationResponse(
            id=res.id,
            pnr=res.pnr,
            user_id=res.user_id,
            flight=flight_resp,
            total_amount=res.total_amount,
            status=res.status,
            passengers=passengers_resp,
            created_at=res.created_at,
            updated_at=res.updated_at
        )

    def create_reservation(self, current_user: User, payload: ReservationCreate) -> ReservationResponse:
        flight = self.flight_repo.get_by_id(payload.flight_id)
        if not flight:
            raise FlightGuardException(
                code="FLIGHT_NOT_FOUND",
                message="Target flight for reservation was not found.",
                status_code=404
            )

        if flight.status == "CANCELLED":
            raise FlightGuardException(
                code="FLIGHT_CANCELLED",
                message="Cannot reserve seats on a cancelled flight.",
                status_code=400
            )

        requested_seats = len(payload.passengers)
        if flight.available_seats < requested_seats:
            raise FlightGuardException(
                code="INSUFFICIENT_SEATS",
                message=f"Only {flight.available_seats} seats remaining. Cannot book {requested_seats} seats.",
                status_code=400
            )

        # Calculate trusted total fare on the server (flight.base_price * passenger_count)
        trusted_total_amount = round(flight.base_price * requested_seats, 2)

        passengers_data = [p.model_dump() for p in payload.passengers]

        res = self.repo.create_reservation(
            user_id=current_user.id,
            flight=flight,
            passengers_data=passengers_data,
            total_amount=trusted_total_amount
        )

        return self._to_reservation_response(res)

    def get_my_reservations(self, current_user: User, page: int = 1, limit: int = 10) -> PaginatedReservationResponse:
        items, total = self.repo.get_by_user_id(current_user.id, page=page, limit=limit)
        res_list = [self._to_reservation_response(r) for r in items]
        total_pages = math.ceil(total / limit) if limit > 0 else 1

        return PaginatedReservationResponse(
            items=res_list,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    def get_reservation_by_pnr(self, current_user: User, pnr: str) -> ReservationResponse:
        res = self.repo.get_by_pnr(pnr)
        if not res:
            raise FlightGuardException(
                code="RESERVATION_NOT_FOUND",
                message=f"No reservation found with PNR '{pnr}'.",
                status_code=404
            )

        # IDOR Check: Ensure passenger owns reservation or user is Ops/Admin
        if current_user.role.name not in ["OPERATIONS_AGENT", "ADMIN"] and res.user_id != current_user.id:
            raise FlightGuardException(
                code="PERMISSION_DENIED",
                message="You do not have permission to view this reservation.",
                status_code=403
            )

        return self._to_reservation_response(res)

    def cancel_reservation(self, current_user: User, reservation_id: str) -> ReservationResponse:
        res = self.repo.get_by_id(reservation_id)
        if not res:
            raise FlightGuardException(
                code="RESERVATION_NOT_FOUND",
                message="Reservation to cancel was not found.",
                status_code=404
            )

        # IDOR Check: Ensure passenger owns reservation or user is Admin
        if current_user.role.name != "ADMIN" and res.user_id != current_user.id:
            raise FlightGuardException(
                code="PERMISSION_DENIED",
                message="You do not have permission to cancel this reservation.",
                status_code=403
            )

        cancelled_res = self.repo.cancel_reservation(res)
        return self._to_reservation_response(cancelled_res)
