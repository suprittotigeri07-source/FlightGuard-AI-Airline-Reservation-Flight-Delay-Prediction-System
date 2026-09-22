from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower().strip()).first()

    def get_role_by_name(self, role_name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == role_name.upper()).first()

    def create_role_if_not_exists(self, name: str, description: str = "") -> Role:
        role = self.get_role_by_name(name)
        if not role:
            role = Role(name=name.upper(), description=description)
            self.db.add(role)
            self.db.commit()
            self.db.refresh(role)
        return role

    def create_user(self, email: str, hashed_password: str, first_name: str, last_name: str, role_id: str) -> User:
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            role_id=role_id,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
