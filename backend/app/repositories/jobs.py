from __future__ import annotations

import json
import sqlite3
from typing import Any

from backend.app.core.database import get_connection


def _job_row(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    data = dict(row)
    data["required_skills"] = json.loads(data.pop("required_skills_json") or "[]")
    return data


class JobRepository:
    def upsert_department(self, employer_id: int, name: str | None) -> int | None:
        if not name:
            return None
        clean_name = name.strip()
        with get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO departments (employer_id, name) VALUES (?, ?)",
                (employer_id, clean_name),
            )
            row = conn.execute(
                "SELECT id FROM departments WHERE employer_id = ? AND name = ?",
                (employer_id, clean_name),
            ).fetchone()
        return int(row["id"])

    def create(self, employer_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        department_id = self.upsert_department(employer_id, payload.get("department_name"))
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO jobs
                  (employer_id, department_id, title, description, required_skills_json,
                   work_style, location, salary_min, salary_max, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    employer_id,
                    department_id,
                    payload["title"],
                    payload["description"],
                    json.dumps(payload.get("required_skills", [])),
                    payload.get("work_style", "Hybrid"),
                    payload.get("location"),
                    payload.get("salary_min"),
                    payload.get("salary_max"),
                    payload.get("status", "draft"),
                ),
            )
            row = conn.execute(
                """
                SELECT jobs.*, departments.name AS department_name,
                  (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.id) AS applications_count
                FROM jobs
                LEFT JOIN departments ON departments.id = jobs.department_id
                WHERE jobs.id = ?
                """,
                (cursor.lastrowid,),
            ).fetchone()
        return _job_row(row)

    def list(self, employer_id: int | None = None, status: str | None = None) -> list[dict[str, Any]]:
        filters: list[str] = []
        params: list[Any] = []
        if employer_id is not None:
            filters.append("jobs.employer_id = ?")
            params.append(employer_id)
        if status is not None:
            filters.append("jobs.status = ?")
            params.append(status)
        where = f"WHERE {' AND '.join(filters)}" if filters else ""
        with get_connection() as conn:
            rows = conn.execute(
                f"""
                SELECT jobs.*, departments.name AS department_name,
                  (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.id) AS applications_count
                FROM jobs
                LEFT JOIN departments ON departments.id = jobs.department_id
                {where}
                ORDER BY jobs.created_at DESC
                """,
                params,
            ).fetchall()
        return [_job_row(row) for row in rows]

    def count_by_employer(self, employer_id: int) -> dict[str, int]:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT status, COUNT(*) AS count
                FROM jobs
                WHERE employer_id = ?
                GROUP BY status
                """,
                (employer_id,),
            ).fetchall()
            applications = conn.execute(
                """
                SELECT COUNT(*) AS count
                FROM applications
                JOIN jobs ON jobs.id = applications.job_id
                WHERE jobs.employer_id = ?
                """,
                (employer_id,),
            ).fetchone()["count"]
        counts = {"draft": 0, "open": 0, "closed": 0, "applications": applications}
        for row in rows:
            counts[row["status"]] = row["count"]
        return counts

    def get(self, job_id: int) -> dict[str, Any] | None:
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT jobs.*, departments.name AS department_name,
                  (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.id) AS applications_count
                FROM jobs
                LEFT JOIN departments ON departments.id = jobs.department_id
                WHERE jobs.id = ?
                """,
                (job_id,),
            ).fetchone()
        return _job_row(row)

    def create_application(self, job_id: int, employee_id: int, match_score: float) -> dict[str, Any]:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO applications (job_id, employee_id, match_score)
                VALUES (?, ?, ?)
                """,
                (job_id, employee_id, match_score),
            )
            row = conn.execute("SELECT * FROM applications WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(row)

    def list_applications_for_employee(self, employee_id: int) -> list[dict[str, Any]]:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT
                  applications.*,
                  jobs.title AS job_title,
                  jobs.work_style,
                  jobs.location,
                  jobs.required_skills_json,
                  employer_profiles.company_name
                FROM applications
                JOIN jobs ON jobs.id = applications.job_id
                JOIN employer_profiles ON employer_profiles.id = jobs.employer_id
                WHERE applications.employee_id = ?
                ORDER BY applications.created_at DESC
                """,
                (employee_id,),
            ).fetchall()
        return [self._application_detail(row) for row in rows]

    def list_applications_for_employer(self, employer_id: int) -> list[dict[str, Any]]:
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT
                  applications.*,
                  jobs.title AS job_title,
                  jobs.work_style,
                  jobs.location,
                  jobs.required_skills_json,
                  employee_profiles.full_name AS candidate_name
                FROM applications
                JOIN jobs ON jobs.id = applications.job_id
                JOIN employee_profiles ON employee_profiles.id = applications.employee_id
                WHERE jobs.employer_id = ?
                ORDER BY applications.created_at DESC
                """,
                (employer_id,),
            ).fetchall()
        return [self._application_detail(row) for row in rows]

    def _application_detail(self, row: sqlite3.Row) -> dict[str, Any]:
        data = dict(row)
        data["required_skills"] = json.loads(data.pop("required_skills_json") or "[]")
        return data
