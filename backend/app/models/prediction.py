import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class DelayPrediction(Base):
    __tablename__ = "delay_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flight_id = Column(String(36), ForeignKey("flights.id"), nullable=False, index=True)
    delay_probability = Column(Float, nullable=False)
    predicted_delay_minutes = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    contributing_factors_json = Column(Text, nullable=True)
    model_version = Column(String(30), nullable=False, default="v1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    flight = relationship("Flight", back_populates="delay_prediction")

    def __repr__(self):
        return f"<DelayPrediction {self.flight_id} Risk: {self.risk_level}>"
