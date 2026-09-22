import uuid
from sqlalchemy import Column, String
from app.db.session import Base


class Airport(Base):
    __tablename__ = "airports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    timezone = Column(String(50), nullable=False, default="UTC")

    def __repr__(self):
        return f"<Airport {self.code} - {self.city}>"
