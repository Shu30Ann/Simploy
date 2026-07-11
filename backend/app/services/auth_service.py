import sqlite3

from fastapi import HTTPException, status

from backend.app.core.config import settings
from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.core.supabase import supabase, supabase_auth
from backend.app.repositories.users import ProfileRepository, UserRepository
from backend.app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic


class AuthService:
    def __init__(self) -> None:
        self.users = UserRepository()
        self.profiles = ProfileRepository()

    def signup(self, payload: SignupRequest) -> AuthResponse:
        if settings.supabase_enabled:
            return self._supabase_signup(payload)

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
        if settings.supabase_enabled:
            return self._supabase_login(payload)

        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        return self._auth_response(user)

    def _auth_response(self, user: dict) -> AuthResponse:
        public = UserPublic(id=user["id"], email=user["email"], role=user["role"], created_at=user["created_at"])
        return AuthResponse(access_token=create_access_token(str(user["id"]), user["role"]), user=public)

    def _supabase_signup(self, payload: SignupRequest) -> AuthResponse:
        normalized_email = payload.email.strip().lower()
        metadata = {
            "role": payload.role,
            "full_name": payload.full_name,
            "company_name": payload.company_name,
        }
        auth_payload = supabase_auth().auth_signup(normalized_email, payload.password, metadata)
        auth_user = auth_payload.get("user") or {}
        supabase_user_id = auth_user.get("id")
        if not supabase_user_id:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase did not return a user")

        user = supabase().insert(
            "users",
            {"email": normalized_email, "role": payload.role, "supabase_user_id": supabase_user_id},
        )

        if payload.role == "employee":
            self.profiles.create_employee_profile(
                user["id"],
                full_name=payload.full_name or normalized_email.split("@")[0].title(),
                skills=["communication", "analytics"],
            )
        elif payload.role == "employer":
            self.profiles.create_employer_profile(
                user["id"],
                company_name=payload.company_name or f"{normalized_email.split('@')[0].title()} Company",
            )

        return AuthResponse(access_token=auth_payload.get("access_token") or "", user=self._public_user(user))

    def _supabase_login(self, payload: LoginRequest) -> AuthResponse:
        auth_payload = supabase_auth().auth_login(payload.email.strip().lower(), payload.password)
        auth_user = auth_payload.get("user") or {}
        user = self.users.get_by_supabase_id(auth_user.get("id"))
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account profile was not found")
        return AuthResponse(access_token=auth_payload["access_token"], user=self._public_user(user))

    def _public_user(self, user: dict) -> UserPublic:
        return UserPublic(id=user["id"], email=user["email"], role=user["role"], created_at=user["created_at"])
