import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Flight(Base):
    __tablename__ = "flights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flight_number = Column(String(20), nullable=False, index=True)
    airline_id = Column(String(36), ForeignKey("airlines.id"), nullable=False)
    aircraft_id = Column(String(36), ForeignKey("aircraft.id"), nullable=False)
    origin_airport_id = Column(String(36), ForeignKey("airports.id"), nullable=False, index=True)
    destination_airport_id = Column(String(36), ForeignKey("airports.id"), nullable=False, index=True)
    scheduled_departure = Column(DateTime, nullable=False, index=True)
    scheduled_arrival = Column(DateTime, nullable=False)
    actual_departure = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    status = Column(String(30), nullable=False, default="SCHEDULED")
    base_price = Column(Float, nullable=False)
    available_seats = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    airline = relationship("Airline", lazy="joined")
    aircraft = relationship("Aircraft", lazy="joined")
    origin = relationship("Airport", foreign_keys=[origin_airport_id], lazy="joined")
    destination = relationship("Airport", foreign_keys=[destination_airport_id], lazy="joined")
    delay_prediction = relationship("DelayPrediction", back_populates="flight", uselist=False, lazy="joined")

    def __repr__(self):
        return f"<Flight {self.flight_number}>"
