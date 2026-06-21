from typing import Literal

from pydantic import BaseModel, Field


UserRole = Literal["employee", "employer", "admin"]


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    role: UserRole
    full_name: str | None = None
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    role: UserRole
    created_at: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
