from __future__ import annotations

import json
import sqlite3
from typing import Any

from backend.app.core.config import settings
from backend.app.core.database import get_connection
from backend.app.core.supabase import supabase


def _job_row(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    data = dict(row)
    skills = data.pop("required_skills_json") or []
    data["required_skills"] = skills if isinstance(skills, list) else json.loads(skills)
    return data


class JobRepository:
    def upsert_department(self, employer_id: int, name: str | None) -> int | None:
        if not name:
            return None
        clean_name = name.strip()
        if settings.supabase_enabled:
            existing = supabase().select("departments", {"employer_id": employer_id, "name": clean_name}, limit=1)
            if existing:
                return int(existing[0]["id"])
            return int(supabase().insert("departments", {"employer_id": employer_id, "name": clean_name})["id"])
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
        if settings.supabase_enabled:
            row = supabase().insert(
                "jobs",
                {
                    "employer_id": employer_id,
                    "department_id": department_id,
                    "title": payload["title"],
                    "description": payload["description"],
                    "required_skills_json": payload.get("required_skills", []),
                    "work_style": payload.get("work_style", "Hybrid"),
                    "location": payload.get("location"),
                    "salary_min": payload.get("salary_min"),
                    "salary_max": payload.get("salary_max"),
                    "status": payload.get("status", "draft"),
                },
            )
            return self._hydrate_job(row)
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
        if settings.supabase_enabled:
            filters: dict[str, Any] = {}
            if employer_id is not None:
                filters["employer_id"] = employer_id
            if status is not None:
                filters["status"] = status
            rows = supabase().select("jobs", filters=filters, order="created_at.desc")
            return [self._hydrate_job(row) for row in rows]

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
        if settings.supabase_enabled:
            jobs = supabase().select("jobs", {"employer_id": employer_id})
            counts = {"draft": 0, "open": 0, "closed": 0, "applications": 0}
            job_ids = [job["id"] for job in jobs]
            for job in jobs:
                counts[job["status"]] = counts.get(job["status"], 0) + 1
            for job_id in job_ids:
                counts["applications"] += supabase().count("applications", {"job_id": job_id})
            return counts
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
        if settings.supabase_enabled:
            rows = supabase().select("jobs", {"id": job_id}, limit=1)
            return self._hydrate_job(rows[0]) if rows else None
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
        if settings.supabase_enabled:
            return supabase().insert(
                "applications",
                {"job_id": job_id, "employee_id": employee_id, "match_score": match_score},
            )
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
        if settings.supabase_enabled:
            rows = supabase().select("applications", {"employee_id": employee_id}, order="created_at.desc")
            return [self._hydrate_application(row, for_employee=True) for row in rows]
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
        if settings.supabase_enabled:
            jobs = supabase().select("jobs", {"employer_id": employer_id})
            rows: list[dict[str, Any]] = []
            for job in jobs:
                rows.extend(supabase().select("applications", {"job_id": job["id"]}, order="created_at.desc"))
            return [self._hydrate_application(row, for_employee=False) for row in rows]
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
        skills = data.pop("required_skills_json") or []
        data["required_skills"] = skills if isinstance(skills, list) else json.loads(skills)
        return data

    def _hydrate_job(self, row: dict[str, Any]) -> dict[str, Any]:
        data = _job_row(row)
        department_id = data.get("department_id")
        data["department_name"] = None
        if department_id is not None:
            departments = supabase().select("departments", {"id": department_id}, limit=1)
            data["department_name"] = departments[0]["name"] if departments else None
        data["applications_count"] = supabase().count("applications", {"job_id": data["id"]})
        return data

    def _hydrate_application(self, row: dict[str, Any], *, for_employee: bool) -> dict[str, Any]:
        data = dict(row)
        job = self.get(data["job_id"])
        data["job_title"] = job["title"] if job else ""
        data["work_style"] = job["work_style"] if job else ""
        data["location"] = job.get("location") if job else None
        data["required_skills"] = job.get("required_skills", []) if job else []
        data["company_name"] = None
        data["candidate_name"] = None
        if job and for_employee:
            employers = supabase().select("employer_profiles", {"id": job["employer_id"]}, limit=1)
            data["company_name"] = employers[0]["company_name"] if employers else None
        if not for_employee:
            employees = supabase().select("employee_profiles", {"id": data["employee_id"]}, limit=1)
            data["candidate_name"] = employees[0]["full_name"] if employees else None
        return data
