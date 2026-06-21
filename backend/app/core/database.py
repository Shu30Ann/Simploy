import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from backend.app.core.config import settings


def adapt_json(value: Any) -> str:
    return json.dumps(value)


def parse_json(value: str | bytes | None) -> Any:
    if value is None:
        return None
    if isinstance(value, bytes):
        value = value.decode("utf-8")
    return json.loads(value)


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('employee', 'employer', 'admin')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS employee_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                full_name TEXT NOT NULL,
                location TEXT,
                target_role TEXT,
                experience_years INTEGER NOT NULL DEFAULT 0,
                skills_json TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS employer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                company_name TEXT NOT NULL,
                industry TEXT,
                company_size INTEGER,
                location TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                UNIQUE(employer_id, name)
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
                department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                required_skills_json TEXT NOT NULL DEFAULT '[]',
                work_style TEXT NOT NULL DEFAULT 'Hybrid',
                location TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                status TEXT NOT NULL DEFAULT 'draft',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                employee_id INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
                status TEXT NOT NULL DEFAULT 'submitted',
                match_score REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(job_id, employee_id)
            );

            CREATE TABLE IF NOT EXISTS simulations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employer_id INTEGER REFERENCES employer_profiles(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                input_json TEXT NOT NULL,
                result_json TEXT NOT NULL,
                model_version TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        seed_demo_data(conn)


def seed_demo_data(conn: sqlite3.Connection) -> None:
    employer = conn.execute("SELECT id FROM users WHERE email = ?", ("demo-employer@simploy.local",)).fetchone()
    if employer is None:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            ("demo-employer@simploy.local", "seeded-account", "employer"),
        )
        user_id = cursor.lastrowid
        profile_cursor = conn.execute(
            """
            INSERT INTO employer_profiles (user_id, company_name, industry, company_size, location)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, "Simploy Demo Talent Network", "Technology", 230, "Kuala Lumpur"),
        )
        employer_id = profile_cursor.lastrowid
    else:
        profile = conn.execute(
            "SELECT id FROM employer_profiles WHERE user_id = ?",
            (employer["id"],),
        ).fetchone()
        employer_id = profile["id"]

    existing_jobs = conn.execute("SELECT COUNT(*) AS count FROM jobs").fetchone()["count"]
    if existing_jobs:
        return

    seeded_jobs = [
        (
            "Product Analytics Lead",
            "Own product analytics, experimentation, and decision dashboards.",
            "Product",
            '["analytics", "sql", "experimentation", "storytelling"]',
            "Hybrid",
            "Kuala Lumpur",
            9000,
            14000,
            "open",
        ),
        (
            "Senior Software Engineer",
            "Build workforce intelligence products across frontend, backend, and data services.",
            "Engineering",
            '["python", "typescript", "cloud", "automation"]',
            "Remote",
            "Malaysia",
            12000,
            18000,
            "open",
        ),
        (
            "Talent Mobility Specialist",
            "Design internal mobility programs and skill transition pathways.",
            "People",
            '["coaching", "talent analytics", "change management"]',
            "Hybrid",
            "Singapore",
            8000,
            13000,
            "open",
        ),
    ]

    for title, description, dept_name, skills, work_style, location, salary_min, salary_max, status in seeded_jobs:
        conn.execute(
            "INSERT OR IGNORE INTO departments (employer_id, name) VALUES (?, ?)",
            (employer_id, dept_name),
        )
        dept = conn.execute(
            "SELECT id FROM departments WHERE employer_id = ? AND name = ?",
            (employer_id, dept_name),
        ).fetchone()
        conn.execute(
            """
            INSERT INTO jobs
              (employer_id, department_id, title, description, required_skills_json,
               work_style, location, salary_min, salary_max, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (employer_id, dept["id"], title, description, skills, work_style, location, salary_min, salary_max, status),
        )
