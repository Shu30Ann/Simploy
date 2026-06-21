import sqlite3

from fastapi import HTTPException, status

from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.repositories.users import ProfileRepository, UserRepository
from backend.app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic


class AuthService:
    def __init__(self) -> None:
        self.users = UserRepository()
        self.profiles = ProfileRepository()

    def signup(self, payload: SignupRequest) -> AuthResponse:
        try:
            user = self.users.create(payload.email, hash_password(payload.password), payload.role)
        except sqlite3.IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered") from exc
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

        if payload.role == "employee":
            self.profiles.create_employee_profile(
                user["id"],
                full_name=payload.full_name or payload.email.split("@")[0].title(),
                skills=["communication", "analytics"],
            )
        elif payload.role == "employer":
            self.profiles.create_employer_profile(
                user["id"],
                company_name=payload.company_name or f"{payload.email.split('@')[0].title()} Company",
            )

        return self._auth_response(user)

    def login(self, payload: LoginRequest) -> AuthResponse:
        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        return self._auth_response(user)

    def _auth_response(self, user: dict) -> AuthResponse:
        public = UserPublic(id=user["id"], email=user["email"], role=user["role"], created_at=user["created_at"])
        return AuthResponse(access_token=create_access_token(str(user["id"]), user["role"]), user=public)
