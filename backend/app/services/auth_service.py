from datetime import timedelta
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.exceptions import FlightGuardException


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register_user(self, payload: UserRegister) -> UserResponse:
        # Check duplicate email
        existing_user = self.repo.get_by_email(payload.email)
        if existing_user:
            raise FlightGuardException(
                code="EMAIL_ALREADY_REGISTERED",
                message="An account with this email address already exists.",
                status_code=400
            )

        # Ensure default PASSENGER role exists
        role = self.repo.create_role_if_not_exists(
            name="PASSENGER",
            description="Standard passenger role for searching and reserving flights"
        )

        hashed_pwd = get_password_hash(payload.password)
        user = self.repo.create_user(
            email=payload.email,
            hashed_password=hashed_pwd,
            first_name=payload.first_name,
            last_name=payload.last_name,
            role_id=role.id
        )

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.name,
            is_active=user.is_active,
            created_at=user.created_at
        )

    def authenticate_user(self, payload: UserLogin) -> Token:
        user = self.repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            # Generic authentication error message to prevent account enumeration
            raise FlightGuardException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password.",
                status_code=401
            )

        if not user.is_active:
            raise FlightGuardException(
                code="ACCOUNT_INACTIVE",
                message="This user account has been deactivated.",
                status_code=403
            )

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token_str = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )

        user_resp = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role.name,
            is_active=user.is_active,
            created_at=user.created_at
        )

        return Token(
            access_token=token_str,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_resp
        )
