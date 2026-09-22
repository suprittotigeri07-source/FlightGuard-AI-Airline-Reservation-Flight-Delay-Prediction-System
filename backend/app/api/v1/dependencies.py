from typing import List
import jwt
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.core.config import settings
from app.core.exceptions import FlightGuardException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise FlightGuardException(
                code="INVALID_TOKEN",
                message="Could not validate credentials.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
    except jwt.PyJWTError:
        raise FlightGuardException(
            code="INVALID_TOKEN",
            message="Could not validate credentials or token expired.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise FlightGuardException(
            code="USER_NOT_FOUND",
            message="User associated with this token no longer exists.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        raise FlightGuardException(
            code="INACTIVE_USER",
            message="User account is inactive.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.upper() for r in allowed_roles]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name.upper() not in self.allowed_roles:
            raise FlightGuardException(
                code="PERMISSION_DENIED",
                message="You do not have sufficient privileges to access this resource.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        return current_user
