import uuid
from sqlalchemy import Column, String
from app.db.session import Base


class Airline(Base):
    __tablename__ = "airlines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100), nullable=True)

    def __repr__(self):
        return f"<Airline {self.code} - {self.name}>"
