import sqlite3

from fastapi import HTTPException, status

from backend.app.core.config import settings
from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.core.supabase import supabase, supabase_auth
from backend.app.repositories.users import ProfileRepository, UserRepository
from backend.app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserPublic


VALID_ROLES = {"employee", "employer", "admin"}


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
        admin_client = supabase()
        auth_client = supabase_auth()

        try:
            auth_response = admin_client.auth_admin_create_user(normalized_email, payload.password, metadata)
        except HTTPException as exc:
            detail = str(exc.detail).lower()
            if "already" in detail or "registered" in detail:
                session = self._supabase_login(
                    LoginRequest(email=normalized_email, password=payload.password, role=payload.role)
                )
                if session.user.role != payload.role:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Email is already registered as {session.user.role}",
                    ) from exc
                return session
            raise

        auth_user = auth_response.get("user") or auth_response
        supabase_user_id = auth_user.get("id")
        if not supabase_user_id:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase did not return a user")

        try:
            user = admin_client.insert(
                "users",
                {"email": normalized_email, "role": payload.role, "supabase_user_id": supabase_user_id},
            )
            self._ensure_profile(user, metadata)
        except Exception:
            try:
                admin_client.auth_admin_delete_user(supabase_user_id)
            except HTTPException:
                pass
            raise

        auth_payload = auth_client.auth_login(normalized_email, payload.password)
        return AuthResponse(access_token=auth_payload["access_token"], user=self._public_user(user))

    def _supabase_login(self, payload: LoginRequest) -> AuthResponse:
        normalized_email = payload.email.strip().lower()
        auth_payload = supabase_auth().auth_login(normalized_email, payload.password)
        auth_user = auth_payload.get("user") or {}
        user = self.users.get_by_supabase_id(auth_user.get("id"))
        if user is None:
            user = self._create_app_user_from_auth_user(auth_user, fallback_role=payload.role)
        else:
            metadata = self._metadata_from_auth_user(auth_user)
            self._ensure_profile(user, metadata)
        return AuthResponse(access_token=auth_payload["access_token"], user=self._public_user(user))

    def _public_user(self, user: dict) -> UserPublic:
        return UserPublic(id=user["id"], email=user["email"], role=user["role"], created_at=user["created_at"])

    def _create_app_user_from_auth_user(self, auth_user: dict, fallback_role: str | None = None) -> dict:
        supabase_user_id = auth_user.get("id")
        email = (auth_user.get("email") or "").strip().lower()
        metadata = self._metadata_from_auth_user(auth_user)
        role = metadata.get("role") or fallback_role

        if not supabase_user_id or not email or role not in VALID_ROLES:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account profile is incomplete. Please sign up again or contact support.",
            )

        try:
            user = supabase().insert(
                "users",
                {"email": email, "role": role, "supabase_user_id": supabase_user_id},
            )
        except HTTPException as exc:
            if exc.status_code == status.HTTP_409_CONFLICT:
                existing = self.users.get_by_email(email)
                if existing is not None:
                    self._ensure_profile(existing, metadata)
                    return existing
            raise

        self._ensure_profile(user, metadata)
        return user

    def _ensure_profile(self, user: dict, metadata: dict) -> None:
        role = user["role"]
        if role == "employee" and self.profiles.get_employee_by_user_id(user["id"]) is None:
            self.profiles.create_employee_profile(
                user["id"],
                full_name=metadata.get("full_name") or user["email"].split("@")[0].title(),
                skills=["communication", "analytics"],
            )
        elif role == "employer" and self.profiles.get_employer_by_user_id(user["id"]) is None:
            self.profiles.create_employer_profile(
                user["id"],
                company_name=metadata.get("company_name") or f"{user['email'].split('@')[0].title()} Company",
            )

    def _metadata_from_auth_user(self, auth_user: dict) -> dict:
        user_metadata = auth_user.get("user_metadata") or {}
        app_metadata = auth_user.get("app_metadata") or {}
        return {**app_metadata, **user_metadata}
