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

            CREATE TABLE IF NOT EXISTS career_north_star_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL UNIQUE REFERENCES employee_profiles(id) ON DELETE CASCADE,
                target_occupation_id INTEGER,
                target_role TEXT,
                target_industry TEXT,
                career_ambition TEXT,
                headline TEXT,
                motivation TEXT,
                target_timeline_months INTEGER,
                target_retirement_age INTEGER,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL UNIQUE REFERENCES employee_profiles(id) ON DELETE CASCADE,
                preferred_locations_json TEXT NOT NULL DEFAULT '[]',
                preferred_work_styles_json TEXT NOT NULL DEFAULT '[]',
                preferred_industries_json TEXT NOT NULL DEFAULT '[]',
                salary_min INTEGER,
                salary_currency TEXT NOT NULL DEFAULT 'MYR',
                open_to_relocation INTEGER NOT NULL DEFAULT 0,
                open_to_remote INTEGER NOT NULL DEFAULT 1,
                risk_tolerance TEXT,
                learning_budget INTEGER,
                preferred_company_type TEXT,
                international_mobility INTEGER NOT NULL DEFAULT 0,
                top_priorities_json TEXT NOT NULL DEFAULT '[]',
                notes TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_priority_weights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
                weight_key TEXT NOT NULL,
                weight_value REAL NOT NULL,
                label TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(employee_profile_id, weight_key)
            );

            CREATE TABLE IF NOT EXISTS career_constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
                constraint_type TEXT NOT NULL,
                label TEXT NOT NULL,
                constraint_value_json TEXT NOT NULL DEFAULT '{}',
                is_blocking INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_onboarding_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL UNIQUE REFERENCES employee_profiles(id) ON DELETE CASCADE,
                current_step TEXT NOT NULL DEFAULT 'north_star',
                completed_steps_json TEXT NOT NULL DEFAULT '[]',
                is_complete INTEGER NOT NULL DEFAULT 0,
                last_completed_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS occupations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                family TEXT NOT NULL,
                description TEXT,
                seniority_level TEXT,
                source_label TEXT NOT NULL DEFAULT 'illustrative_seed',
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS occupation_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                occupation_id INTEGER NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
                skill_name TEXT NOT NULL,
                skill_type TEXT NOT NULL DEFAULT 'required',
                proficiency_level TEXT NOT NULL DEFAULT 'foundation',
                priority INTEGER NOT NULL DEFAULT 3,
                source_label TEXT NOT NULL DEFAULT 'illustrative_seed',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(occupation_id, skill_name)
            );

            CREATE TABLE IF NOT EXISTS career_transitions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                from_occupation_id INTEGER REFERENCES occupations(id) ON DELETE SET NULL,
                to_occupation_id INTEGER NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                path_family TEXT NOT NULL,
                difficulty TEXT NOT NULL DEFAULT 'moderate',
                estimated_months INTEGER NOT NULL,
                rationale TEXT,
                source_label TEXT NOT NULL DEFAULT 'illustrative_seed',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
                north_star_setting_id INTEGER REFERENCES career_north_star_settings(id) ON DELETE SET NULL,
                target_occupation_id INTEGER REFERENCES occupations(id) ON DELETE SET NULL,
                title TEXT NOT NULL,
                summary TEXT,
                status TEXT NOT NULL DEFAULT 'draft',
                current_version INTEGER NOT NULL DEFAULT 1,
                readiness_score_snapshot REAL,
                fit_score_snapshot REAL,
                scoring_version TEXT NOT NULL DEFAULT 'not_scored_phase_1',
                source_label TEXT NOT NULL DEFAULT 'user_or_system_created',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id INTEGER NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
                route_type TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT,
                sequence INTEGER NOT NULL,
                estimated_months INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(roadmap_id, sequence)
            );

            CREATE TABLE IF NOT EXISTS roadmap_milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                route_id INTEGER NOT NULL REFERENCES career_routes(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                sequence INTEGER NOT NULL,
                duration_weeks INTEGER,
                focus_skill_name TEXT,
                status TEXT NOT NULL DEFAULT 'planned',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(route_id, sequence)
            );

            CREATE TABLE IF NOT EXISTS milestone_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                milestone_id INTEGER NOT NULL REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
                action_type TEXT NOT NULL DEFAULT 'learning',
                title TEXT NOT NULL,
                description TEXT,
                sequence INTEGER NOT NULL,
                estimated_hours REAL,
                resource_url TEXT,
                status TEXT NOT NULL DEFAULT 'planned',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(milestone_id, sequence)
            );

            CREATE TABLE IF NOT EXISTS roadmap_score_components (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id INTEGER NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
                component_key TEXT NOT NULL,
                label TEXT NOT NULL,
                score REAL,
                weight REAL,
                explanation TEXT,
                source_label TEXT NOT NULL DEFAULT 'not_scored_phase_1',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(roadmap_id, component_key)
            );

            CREATE TABLE IF NOT EXISTS roadmap_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id INTEGER NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
                version_number INTEGER NOT NULL,
                change_summary TEXT,
                roadmap_snapshot_json TEXT NOT NULL DEFAULT '{}',
                created_by_employee_profile_id INTEGER REFERENCES employee_profiles(id) ON DELETE SET NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(roadmap_id, version_number)
            );

            CREATE TABLE IF NOT EXISTS career_buddy_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_profile_id INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
                roadmap_id INTEGER REFERENCES career_roadmaps(id) ON DELETE SET NULL,
                title TEXT NOT NULL DEFAULT 'Career Buddy conversation',
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_buddy_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL REFERENCES career_buddy_conversations(id) ON DELETE CASCADE,
                sender TEXT NOT NULL,
                content TEXT NOT NULL,
                structured_response_json TEXT NOT NULL DEFAULT '{}',
                provider TEXT NOT NULL DEFAULT 'template',
                model TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        ensure_sqlite_column(
            conn,
            "career_preferences",
            "international_mobility",
            "INTEGER NOT NULL DEFAULT 0",
        )
        seed_demo_data(conn)
        seed_career_gps_reference_data(conn)


def ensure_sqlite_column(conn: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    existing_columns = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing_columns:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


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


def seed_career_gps_reference_data(conn: sqlite3.Connection) -> None:
    occupations = [
        (
            "cloud_support_engineer",
            "Cloud Support Engineer",
            "technology",
            "Supports cloud infrastructure, triages incidents, and automates repeat operational tasks.",
            "junior",
        ),
        (
            "application_engineer",
            "Application Engineer",
            "technology",
            "Builds application features across frontend, backend, and platform services.",
            "mid",
        ),
        (
            "data_analyst",
            "Data Analyst",
            "data",
            "Turns business data into dashboards, analysis, and decision-ready recommendations.",
            "junior",
        ),
        (
            "analytics_engineer",
            "Analytics Engineer",
            "data",
            "Designs reusable analytics models, metrics, and reliable data pipelines for decision teams.",
            "mid",
        ),
        (
            "project_coordinator",
            "Project Coordinator",
            "project-management",
            "Coordinates project plans, schedules, stakeholders, and delivery documentation.",
            "junior",
        ),
        (
            "project_manager",
            "Project Manager",
            "project-management",
            "Owns delivery plans, risks, stakeholders, and cross-functional execution.",
            "mid",
        ),
    ]
    for slug, title, family, description, seniority in occupations:
        conn.execute(
            """
            INSERT OR IGNORE INTO occupations
              (slug, title, family, description, seniority_level, source_label)
            VALUES (?, ?, ?, ?, ?, 'illustrative_seed')
            """,
            (slug, title, family, description, seniority),
        )

    occupation_skills = [
        ("cloud_support_engineer", "cloud", "required", "foundation", 5),
        ("cloud_support_engineer", "automation", "required", "foundation", 4),
        ("cloud_support_engineer", "communication", "preferred", "foundation", 3),
        ("application_engineer", "typescript", "required", "intermediate", 5),
        ("application_engineer", "python", "required", "intermediate", 4),
        ("application_engineer", "cloud", "preferred", "intermediate", 3),
        ("data_analyst", "analytics", "required", "foundation", 5),
        ("data_analyst", "sql", "required", "foundation", 5),
        ("data_analyst", "storytelling", "preferred", "foundation", 3),
        ("analytics_engineer", "sql", "required", "advanced", 5),
        ("analytics_engineer", "python", "required", "intermediate", 4),
        ("analytics_engineer", "experimentation", "preferred", "intermediate", 3),
        ("project_coordinator", "communication", "required", "foundation", 5),
        ("project_coordinator", "project management", "required", "foundation", 4),
        ("project_coordinator", "stakeholder management", "preferred", "foundation", 3),
        ("project_manager", "project management", "required", "intermediate", 5),
        ("project_manager", "stakeholder management", "required", "intermediate", 5),
        ("project_manager", "change management", "preferred", "intermediate", 3),
    ]
    for occupation_slug, skill_name, skill_type, proficiency, priority in occupation_skills:
        occupation = conn.execute("SELECT id FROM occupations WHERE slug = ?", (occupation_slug,)).fetchone()
        if occupation is None:
            continue
        conn.execute(
            """
            INSERT OR IGNORE INTO occupation_skills
              (occupation_id, skill_name, skill_type, proficiency_level, priority, source_label)
            VALUES (?, ?, ?, ?, ?, 'illustrative_seed')
            """,
            (occupation["id"], skill_name, skill_type, proficiency, priority),
        )

    transitions = [
        (
            "technology_cloud_support_to_application_engineer",
            "cloud_support_engineer",
            "application_engineer",
            "Technology builder path",
            "technology",
            "moderate",
            9,
            "Illustrative transition from cloud support into application engineering using automation, Python, TypeScript, and cloud skills.",
        ),
        (
            "data_analyst_to_analytics_engineer",
            "data_analyst",
            "analytics_engineer",
            "Data platform path",
            "data",
            "moderate",
            8,
            "Illustrative transition from dashboard analysis into reusable analytics models and data pipelines.",
        ),
        (
            "project_coordinator_to_project_manager",
            "project_coordinator",
            "project_manager",
            "Project-management leadership path",
            "project-management",
            "moderate",
            6,
            "Illustrative transition from coordination responsibilities into ownership of scope, risk, stakeholders, and delivery outcomes.",
        ),
    ]
    for slug, from_slug, to_slug, title, family, difficulty, months, rationale in transitions:
        source = conn.execute("SELECT id FROM occupations WHERE slug = ?", (from_slug,)).fetchone()
        target = conn.execute("SELECT id FROM occupations WHERE slug = ?", (to_slug,)).fetchone()
        if target is None:
            continue
        conn.execute(
            """
            INSERT OR IGNORE INTO career_transitions
              (slug, from_occupation_id, to_occupation_id, title, path_family, difficulty, estimated_months, rationale, source_label)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'illustrative_seed')
            """,
            (slug, source["id"] if source else None, target["id"], title, family, difficulty, months, rationale),
        )
