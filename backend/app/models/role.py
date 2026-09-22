import uuid
from sqlalchemy import Column, String, Text
from app.db.session import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Role {self.name}>"
