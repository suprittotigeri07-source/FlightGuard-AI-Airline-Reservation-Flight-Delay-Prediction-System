import string
import random
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.reservation import Reservation
from app.models.passenger import Passenger
from app.models.flight import Flight


class ReservationRepository:
    def __init__(self, db: Session):
        self.db = db

    def _generate_unique_pnr(self) -> str:
        chars = string.ascii_uppercase + string.digits
        for _ in range(10):
            candidate = ''.join(random.choices(chars, k=6))
            existing = self.db.query(Reservation).filter(Reservation.pnr == candidate).first()
            if not existing:
                return candidate
        return ''.join(random.choices(chars, k=6))

    def get_by_id(self, reservation_id: str) -> Optional[Reservation]:
        return self.db.query(Reservation).filter(Reservation.id == reservation_id).first()

    def get_by_pnr(self, pnr: str) -> Optional[Reservation]:
        return self.db.query(Reservation).filter(Reservation.pnr == pnr.upper().strip()).first()

    def get_by_user_id(
        self, user_id: str, page: int = 1, limit: int = 10
    ) -> Tuple[List[Reservation], int]:
        query = self.db.query(Reservation).filter(Reservation.user_id == user_id).order_by(Reservation.created_at.desc())
        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    def create_reservation(
        self,
        user_id: str,
        flight: Flight,
        passengers_data: List[dict],
        total_amount: float
    ) -> Reservation:
        # Generate PNR
        pnr_code = self._generate_unique_pnr()

        # Create Reservation record
        reservation = Reservation(
            pnr=pnr_code,
            user_id=user_id,
            flight_id=flight.id,
            total_amount=total_amount,
            status="CONFIRMED"
        )
        self.db.add(reservation)
        self.db.flush()  # get reservation.id

        # Create Passenger records
        for idx, p in enumerate(passengers_data):
            passenger = Passenger(
                reservation_id=reservation.id,
                first_name=p["first_name"].strip(),
                last_name=p["last_name"].strip(),
                gender=p.get("gender", "M"),
                seat_number=f"{idx + 1}A"  # Assign preliminary seat number
            )
            self.db.add(passenger)

        # Decrement flight available seats
        flight.available_seats -= len(passengers_data)

        self.db.commit()
        self.db.refresh(reservation)
        return reservation

    def cancel_reservation(self, reservation: Reservation) -> Reservation:
        if reservation.status != "CANCELLED":
            reservation.status = "CANCELLED"
            # Restore flight available seats
            num_passengers = len(reservation.passengers)
            reservation.flight.available_seats += num_passengers
            self.db.commit()
            self.db.refresh(reservation)
        return reservation
