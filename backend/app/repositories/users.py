import json
import re
import sqlite3
from typing import Any

from backend.app.core.database import get_connection


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _row(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row is not None else None


class UserRepository:
    def create(self, email: str, password_hash: str, role: str) -> dict[str, Any]:
        normalized = email.strip().lower()
        if not EMAIL_RE.match(normalized):
            raise ValueError("A valid email address is required")
        with get_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (normalized, password_hash, role),
            )
            row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(row)

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        with get_connection() as conn:
            return _row(conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone())

    def get_by_id(self, user_id: int) -> dict[str, Any] | None:
        with get_connection() as conn:
            return _row(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())


class ProfileRepository:
    def create_employee_profile(
        self,
        user_id: int,
        full_name: str,
        location: str | None = None,
        target_role: str | None = None,
        experience_years: int = 0,
        skills: list[str] | None = None,
    ) -> dict[str, Any]:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO employee_profiles
                  (user_id, full_name, location, target_role, experience_years, skills_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user_id, full_name, location, target_role, experience_years, json.dumps(skills or [])),
            )
            row = conn.execute("SELECT * FROM employee_profiles WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return self._employee_row(row)

    def create_employer_profile(
        self,
        user_id: int,
        company_name: str,
        industry: str | None = None,
        company_size: int | None = None,
        location: str | None = None,
    ) -> dict[str, Any]:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO employer_profiles (user_id, company_name, industry, company_size, location)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, company_name, industry, company_size, location),
            )
            row = conn.execute("SELECT * FROM employer_profiles WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(row)

    def get_employee_by_user_id(self, user_id: int) -> dict[str, Any] | None:
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM employee_profiles WHERE user_id = ?", (user_id,)).fetchone()
        return self._employee_row(row) if row is not None else None

    def get_employer_by_user_id(self, user_id: int) -> dict[str, Any] | None:
        with get_connection() as conn:
            return _row(conn.execute("SELECT * FROM employer_profiles WHERE user_id = ?", (user_id,)).fetchone())

    def update_employee_profile(self, user_id: int, data: dict[str, Any]) -> dict[str, Any] | None:
        current = self.get_employee_by_user_id(user_id)
        if current is None:
            return None
        next_data = {**current, **data}
        with get_connection() as conn:
            conn.execute(
                """
                UPDATE employee_profiles
                SET full_name = ?, location = ?, target_role = ?, experience_years = ?, skills_json = ?
                WHERE user_id = ?
                """,
                (
                    next_data["full_name"],
                    next_data.get("location"),
                    next_data.get("target_role"),
                    next_data.get("experience_years", 0),
                    json.dumps(next_data.get("skills", [])),
                    user_id,
                ),
            )
        return self.get_employee_by_user_id(user_id)

    def update_employer_profile(self, user_id: int, data: dict[str, Any]) -> dict[str, Any] | None:
        current = self.get_employer_by_user_id(user_id)
        if current is None:
            return None
        next_data = {**current, **data}
        with get_connection() as conn:
            conn.execute(
                """
                UPDATE employer_profiles
                SET company_name = ?, industry = ?, company_size = ?, location = ?
                WHERE user_id = ?
                """,
                (
                    next_data["company_name"],
                    next_data.get("industry"),
                    next_data.get("company_size"),
                    next_data.get("location"),
                    user_id,
                ),
            )
        return self.get_employer_by_user_id(user_id)

    def _employee_row(self, row: sqlite3.Row) -> dict[str, Any]:
        data = dict(row)
        data["skills"] = json.loads(data.pop("skills_json") or "[]")
        return data
