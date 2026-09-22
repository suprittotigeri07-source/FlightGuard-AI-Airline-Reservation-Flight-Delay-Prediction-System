from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.api.v1.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register User Account")
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register_user(payload)


@router.post("/login", response_model=Token, summary="User Login (JWT Access Token)")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.authenticate_user(payload)


@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User Profile")
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role.name,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
