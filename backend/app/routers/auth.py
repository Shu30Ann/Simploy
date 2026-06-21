from fastapi import APIRouter, Depends

from backend.app.dependencies import get_current_user
from backend.app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    return AuthService().signup(payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    return AuthService().login(payload)


@router.get("/me", response_model=UserPublic)
def me(user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic(id=user["id"], email=user["email"], role=user["role"], created_at=user["created_at"])
