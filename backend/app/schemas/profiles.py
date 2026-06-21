from pydantic import BaseModel, Field


class EmployeeProfileIn(BaseModel):
    full_name: str
    location: str | None = None
    target_role: str | None = None
    experience_years: int = Field(default=0, ge=0)
    skills: list[str] = []


class EmployeeProfile(EmployeeProfileIn):
    id: int
    user_id: int
    created_at: str


class EmployerProfileIn(BaseModel):
    company_name: str
    industry: str | None = None
    company_size: int | None = Field(default=None, ge=1)
    location: str | None = None


class EmployerProfile(EmployerProfileIn):
    id: int
    user_id: int
    created_at: str
