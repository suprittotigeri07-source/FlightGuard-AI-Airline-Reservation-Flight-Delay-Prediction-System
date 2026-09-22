import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String(36), ForeignKey("reservations.id"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=True)
    seat_number = Column(String(10), nullable=True)

    reservation = relationship("Reservation", back_populates="passengers")

    def __repr__(self):
        return f"<Passenger {self.first_name} {self.last_name}>"
