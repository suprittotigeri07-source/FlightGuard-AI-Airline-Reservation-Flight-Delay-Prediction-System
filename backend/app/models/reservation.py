import uuid
import random
import string
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_pnr() -> str:
    """Generates a 6-character uppercase alphanumeric booking reference (PNR)."""
    chars = string.ascii_uppercase + string.digits
    # Avoid ambiguous characters if needed, e.g. '0', 'O', '1', 'I'
    return ''.join(random.choices(chars, k=6))


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pnr = Column(String(10), unique=True, nullable=False, index=True, default=generate_pnr)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    flight_id = Column(String(36), ForeignKey("flights.id"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="CONFIRMED")  # 'CONFIRMED', 'CANCELLED'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", lazy="joined")
    flight = relationship("Flight", lazy="joined")
    passengers = relationship("Passenger", back_populates="reservation", cascade="all, delete-orphan", lazy="joined")

    def __repr__(self):
        return f"<Reservation PNR: {self.pnr} Status: {self.status}>"
