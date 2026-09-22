import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Aircraft(Base):
    __tablename__ = "aircraft"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tail_number = Column(String(20), unique=True, nullable=False)
    model = Column(String(50), nullable=False)
    total_capacity = Column(Integer, nullable=False)
    airline_id = Column(String(36), ForeignKey("airlines.id"), nullable=False)

    airline = relationship("Airline", lazy="joined")

    def __repr__(self):
        return f"<Aircraft {self.tail_number} ({self.model})>"
