import json
from datetime import datetime, timedelta, timezone
from typing import Any

from backend.app.core.config import settings
from backend.app.core.database import get_connection
from backend.app.core.supabase import supabase


def _first(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    return rows[0] if rows else None


def _json_value(value: Any, default: Any) -> Any:
    if value is None:
        return default
    if isinstance(value, (list, dict)):
        return value
    return json.loads(value)


def _bool_value(value: Any) -> bool:
    return bool(value)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CareerGpsRepository:
    def list_occupations(self) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            return supabase().select("occupations", {"status": "active"}, order="title.asc")
        with get_connection() as conn:
            rows = conn.execute("SELECT * FROM occupations WHERE status = 'active' ORDER BY title ASC").fetchall()
        return [dict(row) for row in rows]

    def list_occupation_skills(self) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            return supabase().select("occupation_skills", order="occupation_id.asc,priority.desc,skill_name.asc")
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM occupation_skills ORDER BY occupation_id ASC, priority DESC, skill_name ASC"
            ).fetchall()
        return [dict(row) for row in rows]

    def list_career_transitions(self) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            return supabase().select("career_transitions", order="estimated_months.asc,title.asc")
        with get_connection() as conn:
            rows = conn.execute("SELECT * FROM career_transitions ORDER BY estimated_months ASC, title ASC").fetchall()
        return [dict(row) for row in rows]

    def get_onboarding_progress(self, employee_profile_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            return self._onboarding_row(
                _first(supabase().select("career_onboarding_progress", {"employee_profile_id": employee_profile_id}, limit=1))
            )
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM career_onboarding_progress WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return self._onboarding_row(dict(row) if row is not None else None)

    def upsert_onboarding_progress(self, employee_profile_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        data = {
            "employee_profile_id": employee_profile_id,
            "current_step": payload["current_step"],
            "completed_steps_json": payload["completed_steps"],
            "is_complete": payload["is_complete"],
            "last_completed_at": _now() if payload["is_complete"] else None,
        }
        if settings.supabase_enabled:
            existing = self.get_onboarding_progress(employee_profile_id)
            row = (
                supabase().update("career_onboarding_progress", {"employee_profile_id": employee_profile_id}, data)
                if existing
                else supabase().insert("career_onboarding_progress", data)
            )
            return self._onboarding_row(row)
        with get_connection() as conn:
            existing = conn.execute(
                "SELECT id FROM career_onboarding_progress WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
            if existing:
                conn.execute(
                    """
                    UPDATE career_onboarding_progress
                    SET current_step = ?, completed_steps_json = ?, is_complete = ?,
                        last_completed_at = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE employee_profile_id = ?
                    """,
                    (
                        data["current_step"],
                        json.dumps(data["completed_steps_json"]),
                        int(data["is_complete"]),
                        data["last_completed_at"],
                        employee_profile_id,
                    ),
                )
            else:
                conn.execute(
                    """
                    INSERT INTO career_onboarding_progress
                      (employee_profile_id, current_step, completed_steps_json, is_complete, last_completed_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        employee_profile_id,
                        data["current_step"],
                        json.dumps(data["completed_steps_json"]),
                        int(data["is_complete"]),
                        data["last_completed_at"],
                    ),
                )
            row = conn.execute(
                "SELECT * FROM career_onboarding_progress WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return self._onboarding_row(dict(row))

    def get_goals(self, employee_profile_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            return self._goals_row(
                _first(supabase().select("career_north_star_settings", {"employee_profile_id": employee_profile_id}, limit=1))
            )
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM career_north_star_settings WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return self._goals_row(dict(row) if row is not None else None)

    def upsert_goals(self, employee_profile_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        data = {
            "employee_profile_id": employee_profile_id,
            "career_ambition": payload.get("career_ambition"),
            "target_role": payload.get("target_role"),
            "target_industry": payload.get("target_industry"),
            "target_retirement_age": payload.get("target_retirement_age"),
            "target_timeline_months": payload.get("target_timeline_months"),
            "motivation": payload.get("motivation"),
            "headline": payload.get("target_role"),
            "status": "active",
        }
        if settings.supabase_enabled:
            existing = self.get_goals(employee_profile_id)
            row = (
                supabase().update("career_north_star_settings", {"employee_profile_id": employee_profile_id}, data)
                if existing
                else supabase().insert("career_north_star_settings", data)
            )
            return self._goals_row(row)
        with get_connection() as conn:
            existing = conn.execute(
                "SELECT id FROM career_north_star_settings WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
            values = (
                data["career_ambition"],
                data["target_role"],
                data["target_industry"],
                data["target_retirement_age"],
                data["target_timeline_months"],
                data["motivation"],
                data["headline"],
                data["status"],
                employee_profile_id,
            )
            if existing:
                conn.execute(
                    """
                    UPDATE career_north_star_settings
                    SET career_ambition = ?, target_role = ?, target_industry = ?,
                        target_retirement_age = ?, target_timeline_months = ?,
                        motivation = ?, headline = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE employee_profile_id = ?
                    """,
                    values,
                )
            else:
                conn.execute(
                    """
                    INSERT INTO career_north_star_settings
                      (career_ambition, target_role, target_industry, target_retirement_age,
                       target_timeline_months, motivation, headline, status, employee_profile_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
            row = conn.execute(
                "SELECT * FROM career_north_star_settings WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return self._goals_row(dict(row))

    def get_lifestyle_priorities(self, employee_profile_id: int) -> dict[str, Any] | None:
        preferences = self._get_preferences(employee_profile_id)
        if preferences is None:
            return None
        weights = self._get_priority_weights(employee_profile_id)
        return self._lifestyle_row(preferences, weights)

    def upsert_lifestyle_priorities(self, employee_profile_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        preference_data = {
            "employee_profile_id": employee_profile_id,
            "preferred_locations_json": payload.get("preferred_locations", []),
            "preferred_work_styles_json": payload.get("preferred_work_styles", []),
            "preferred_industries_json": [],
            "open_to_relocation": payload["willing_to_relocate"],
            "open_to_remote": payload["remote_work_priority"] > 0,
            "risk_tolerance": payload["risk_tolerance"],
            "learning_budget": payload.get("learning_budget"),
            "preferred_company_type": payload.get("preferred_company_type"),
            "international_mobility": payload["international_mobility"],
            "top_priorities_json": payload.get("top_two_non_negotiable_priorities", []),
        }
        if settings.supabase_enabled:
            existing = self._get_preferences(employee_profile_id)
            preferences = (
                supabase().update("career_preferences", {"employee_profile_id": employee_profile_id}, preference_data)
                if existing
                else supabase().insert("career_preferences", preference_data)
            )
        else:
            preferences = self._upsert_sqlite_preferences(employee_profile_id, preference_data)

        weights = {
            "income": ("Income priority", payload["income_priority"]),
            "work_life_balance": ("Work-life balance priority", payload["work_life_balance_priority"]),
            "leadership": ("Leadership priority", payload["leadership_priority"]),
            "job_security": ("Job-security priority", payload["job_security_priority"]),
            "remote_work": ("Remote-work priority", payload["remote_work_priority"]),
        }
        for key, (label, value) in weights.items():
            self._upsert_priority_weight(employee_profile_id, key, label, value / 100)
        return self._lifestyle_row(preferences, self._get_priority_weights(employee_profile_id))

    def list_constraints(self, employee_profile_id: int) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            rows = supabase().select("career_constraints", {"employee_profile_id": employee_profile_id}, order="created_at.asc")
            return [self._constraint_row(row) for row in rows]
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM career_constraints WHERE employee_profile_id = ? ORDER BY created_at ASC",
                (employee_profile_id,),
            ).fetchall()
        return [self._constraint_row(dict(row)) for row in rows]

    def replace_constraints(self, employee_profile_id: int, constraints: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            supabase().delete("career_constraints", {"employee_profile_id": employee_profile_id})
            for item in constraints:
                supabase().insert(
                    "career_constraints",
                    {
                        "employee_profile_id": employee_profile_id,
                        "constraint_type": item["constraint_type"],
                        "label": item["label"],
                        "constraint_value_json": item.get("value", {}),
                        "is_blocking": item.get("is_blocking", False),
                    },
                )
            return self.list_constraints(employee_profile_id)
        with get_connection() as conn:
            conn.execute("DELETE FROM career_constraints WHERE employee_profile_id = ?", (employee_profile_id,))
            for item in constraints:
                conn.execute(
                    """
                    INSERT INTO career_constraints
                      (employee_profile_id, constraint_type, label, constraint_value_json, is_blocking)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        employee_profile_id,
                        item["constraint_type"],
                        item["label"],
                        json.dumps(item.get("value", {})),
                        int(item.get("is_blocking", False)),
                    ),
                )
        return self.list_constraints(employee_profile_id)

    def save_generated_roadmap(
        self,
        *,
        employee_profile_id: int,
        north_star_setting_id: int | None,
        generated: dict[str, Any],
        change_summary: str = "Generated deterministic Career GPS routes.",
    ) -> dict[str, Any]:
        if settings.supabase_enabled:
            return self._save_generated_roadmap_supabase(
                employee_profile_id=employee_profile_id,
                north_star_setting_id=north_star_setting_id,
                generated=generated,
                change_summary=change_summary,
            )
        return self._save_generated_roadmap_sqlite(
            employee_profile_id=employee_profile_id,
            north_star_setting_id=north_star_setting_id,
            generated=generated,
            change_summary=change_summary,
        )

    def get_latest_roadmap_snapshot(self, employee_profile_id: int) -> dict[str, Any] | None:
        roadmap = self._get_active_roadmap(employee_profile_id)
        if roadmap is None:
            return None
        version = self._latest_roadmap_version(roadmap["id"])
        if version is None:
            return None
        snapshot = _json_value(version.get("roadmap_snapshot_json"), {})
        if isinstance(snapshot, dict):
            snapshot.setdefault("roadmap_id", roadmap["id"])
            snapshot.setdefault("version", roadmap.get("current_version", version.get("version_number", 1)))
            self._apply_selected_route(snapshot, roadmap)
        return snapshot

    def get_roadmap_snapshot(self, employee_profile_id: int, roadmap_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            roadmap = _first(
                supabase().select(
                    "career_roadmaps",
                    {"id": roadmap_id, "employee_profile_id": employee_profile_id},
                    limit=1,
                )
            )
        else:
            with get_connection() as conn:
                row = conn.execute(
                    "SELECT * FROM career_roadmaps WHERE id = ? AND employee_profile_id = ?",
                    (roadmap_id, employee_profile_id),
                ).fetchone()
            roadmap = dict(row) if row is not None else None
        if roadmap is None:
            return None
        version = self._latest_roadmap_version(roadmap["id"])
        if version is None:
            return None
        snapshot = _json_value(version.get("roadmap_snapshot_json"), {})
        if isinstance(snapshot, dict):
            snapshot.setdefault("roadmap_id", roadmap["id"])
            snapshot.setdefault("version", roadmap.get("current_version", version.get("version_number", 1)))
            self._apply_selected_route(snapshot, roadmap)
        return snapshot

    def update_selected_route(
        self,
        *,
        employee_profile_id: int,
        roadmap_id: int,
        selected_route_type: str,
    ) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            roadmap = _first(
                supabase().select(
                    "career_roadmaps",
                    {"id": roadmap_id, "employee_profile_id": employee_profile_id},
                    limit=1,
                )
            )
            if roadmap is None:
                return None
            version = self._latest_roadmap_version(roadmap_id)
            if version is None:
                return None
            snapshot = _json_value(version.get("roadmap_snapshot_json"), {})
            if not isinstance(snapshot, dict):
                return None
            snapshot["selected_route_type"] = selected_route_type
            updated_roadmap = supabase().update(
                "career_roadmaps",
                {"id": roadmap_id, "employee_profile_id": employee_profile_id},
                {"selected_route_type": selected_route_type},
            )
            supabase().update(
                "roadmap_versions",
                {"id": version["id"]},
                {"roadmap_snapshot_json": snapshot},
            )
            snapshot.setdefault("roadmap_id", roadmap_id)
            snapshot.setdefault("version", roadmap.get("current_version", version.get("version_number", 1)))
            self._apply_selected_route(snapshot, updated_roadmap or roadmap)
            return snapshot

        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM career_roadmaps
                WHERE id = ? AND employee_profile_id = ?
                """,
                (roadmap_id, employee_profile_id),
            ).fetchone()
            if row is None:
                return None
            roadmap = dict(row)
            version = conn.execute(
                """
                SELECT * FROM roadmap_versions
                WHERE roadmap_id = ?
                ORDER BY version_number DESC
                LIMIT 1
                """,
                (roadmap_id,),
            ).fetchone()
            if version is None:
                return None
            version_data = dict(version)
            snapshot = _json_value(version_data.get("roadmap_snapshot_json"), {})
            if not isinstance(snapshot, dict):
                return None
            snapshot["selected_route_type"] = selected_route_type
            conn.execute(
                """
                UPDATE career_roadmaps
                SET selected_route_type = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND employee_profile_id = ?
                """,
                (selected_route_type, roadmap_id, employee_profile_id),
            )
            conn.execute(
                """
                UPDATE roadmap_versions
                SET roadmap_snapshot_json = ?
                WHERE id = ?
                """,
                (json.dumps(snapshot), version_data["id"]),
            )
            roadmap["selected_route_type"] = selected_route_type
        snapshot.setdefault("roadmap_id", roadmap_id)
        snapshot.setdefault("version", roadmap.get("current_version", version_data.get("version_number", 1)))
        self._apply_selected_route(snapshot, roadmap)
        return snapshot

    def get_milestone_context(
        self,
        *,
        employee_profile_id: int,
        roadmap_id: int,
        route_type: str,
        milestone_sequence: int,
    ) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            roadmap = _first(
                supabase().select(
                    "career_roadmaps",
                    {"id": roadmap_id, "employee_profile_id": employee_profile_id},
                    limit=1,
                )
            )
            if roadmap is None:
                return None
            route = _first(
                supabase().select(
                    "career_routes",
                    {"roadmap_id": roadmap_id, "route_type": route_type},
                    limit=1,
                )
            )
            if route is None:
                return None
            milestone = _first(
                supabase().select(
                    "roadmap_milestones",
                    {"route_id": route["id"], "sequence": milestone_sequence},
                    limit=1,
                )
            )
            if milestone is None:
                return None
            actions = supabase().select(
                "milestone_actions",
                {"milestone_id": milestone["id"]},
                order="sequence.asc",
            )
            return {"roadmap": roadmap, "route": route, "milestone": milestone, "actions": actions}

        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT
                  roadmap.id AS roadmap_id,
                  route.id AS route_id,
                  route.route_type,
                  route.sequence AS route_sequence,
                  milestone.*
                FROM career_roadmaps roadmap
                JOIN career_routes route ON route.roadmap_id = roadmap.id
                JOIN roadmap_milestones milestone ON milestone.route_id = route.id
                WHERE roadmap.id = ?
                  AND roadmap.employee_profile_id = ?
                  AND route.route_type = ?
                  AND milestone.sequence = ?
                """,
                (roadmap_id, employee_profile_id, route_type, milestone_sequence),
            ).fetchone()
            if row is None:
                return None
            milestone = dict(row)
            actions = conn.execute(
                "SELECT * FROM milestone_actions WHERE milestone_id = ? ORDER BY sequence ASC",
                (milestone["id"],),
            ).fetchall()
        return {
            "roadmap": {"id": roadmap_id, "employee_profile_id": employee_profile_id},
            "route": {
                "id": milestone["route_id"],
                "route_type": milestone["route_type"],
                "sequence": milestone["route_sequence"],
            },
            "milestone": milestone,
            "actions": [dict(action) for action in actions],
        }

    def list_roadmap_progress(self, employee_profile_id: int, roadmap_id: int) -> list[dict[str, Any]] | None:
        if settings.supabase_enabled:
            roadmap = _first(
                supabase().select(
                    "career_roadmaps",
                    {"id": roadmap_id, "employee_profile_id": employee_profile_id},
                    limit=1,
                )
            )
            if roadmap is None:
                return None
            rows = supabase().select(
                "roadmap_progress",
                {"employee_profile_id": employee_profile_id, "roadmap_id": roadmap_id},
                order="updated_at.asc",
            )
            return self._progress_rows_with_route_keys_supabase(roadmap_id, rows)

        with get_connection() as conn:
            roadmap = conn.execute(
                "SELECT id FROM career_roadmaps WHERE id = ? AND employee_profile_id = ?",
                (roadmap_id, employee_profile_id),
            ).fetchone()
            if roadmap is None:
                return None
            rows = conn.execute(
                """
                SELECT
                  progress.*,
                  route.route_type,
                  COALESCE(milestone.sequence, action_milestone.sequence) AS milestone_sequence,
                  action.sequence AS action_sequence
                FROM roadmap_progress progress
                LEFT JOIN roadmap_milestones milestone ON milestone.id = progress.milestone_id
                LEFT JOIN milestone_actions action ON action.id = progress.action_id
                LEFT JOIN roadmap_milestones action_milestone ON action_milestone.id = action.milestone_id
                JOIN career_routes route ON route.id = COALESCE(milestone.route_id, action_milestone.route_id)
                WHERE progress.employee_profile_id = ?
                  AND progress.roadmap_id = ?
                ORDER BY route.sequence ASC, milestone_sequence ASC, action_sequence ASC
                """,
                (employee_profile_id, roadmap_id),
            ).fetchall()
        return [self._progress_row(dict(row)) for row in rows]

    def upsert_progress(
        self,
        *,
        employee_profile_id: int,
        roadmap_id: int,
        route_type: str,
        milestone_sequence: int,
        action_sequence: int | None,
        status_value: str,
        notes: str | None,
        evidence_url: str | None,
        completed_at: str | None,
    ) -> dict[str, Any] | None:
        context = self.get_milestone_context(
            employee_profile_id=employee_profile_id,
            roadmap_id=roadmap_id,
            route_type=route_type,
            milestone_sequence=milestone_sequence,
        )
        if context is None:
            return None
        milestone = context["milestone"]
        actions = context["actions"]
        action = next((item for item in actions if int(item["sequence"]) == int(action_sequence)), None) if action_sequence else None
        if action_sequence is not None and action is None:
            return None
        now_value = _now()
        data = {
            "employee_profile_id": employee_profile_id,
            "roadmap_id": roadmap_id,
            "milestone_id": milestone["id"],
            "action_id": action["id"] if action else None,
            "status": status_value,
            "progress_percent": self._progress_percent(status_value),
            "completed_at": completed_at or (now_value if status_value == "completed" else None),
            "notes": notes,
            "evidence_url": evidence_url,
        }
        if settings.supabase_enabled:
            row = self._upsert_progress_supabase(data)
            self._update_progress_source_status_supabase(milestone["id"], action["id"] if action else None, status_value)
            row["route_type"] = route_type
            row["milestone_sequence"] = milestone_sequence
            row["action_sequence"] = action_sequence
            return self._progress_row(row)

        with get_connection() as conn:
            if action is not None:
                existing = conn.execute(
                    """
                    SELECT id FROM roadmap_progress
                    WHERE employee_profile_id = ? AND roadmap_id = ? AND action_id = ?
                    """,
                    (employee_profile_id, roadmap_id, action["id"]),
                ).fetchone()
            else:
                existing = conn.execute(
                    """
                    SELECT id FROM roadmap_progress
                    WHERE employee_profile_id = ? AND roadmap_id = ? AND milestone_id = ? AND action_id IS NULL
                    """,
                    (employee_profile_id, roadmap_id, milestone["id"]),
                ).fetchone()
            values = (
                data["status"],
                data["progress_percent"],
                data["completed_at"],
                data["notes"],
                data["evidence_url"],
            )
            if existing:
                conn.execute(
                    """
                    UPDATE roadmap_progress
                    SET status = ?, progress_percent = ?, completed_at = ?, notes = ?,
                        evidence_url = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (*values, existing["id"]),
                )
                progress_id = existing["id"]
            else:
                cursor = conn.execute(
                    """
                    INSERT INTO roadmap_progress
                      (employee_profile_id, roadmap_id, milestone_id, action_id, status,
                       progress_percent, completed_at, notes, evidence_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        employee_profile_id,
                        roadmap_id,
                        milestone["id"],
                        action["id"] if action else None,
                        *values,
                    ),
                )
                progress_id = cursor.lastrowid
            source_status = self._source_status(status_value)
            if action is not None:
                conn.execute(
                    "UPDATE milestone_actions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (source_status, action["id"]),
                )
            else:
                conn.execute(
                    "UPDATE roadmap_milestones SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (source_status, milestone["id"]),
                )
            row = conn.execute(
                """
                SELECT
                  progress.*,
                  route.route_type,
                  milestone.sequence AS milestone_sequence,
                  action.sequence AS action_sequence
                FROM roadmap_progress progress
                LEFT JOIN milestone_actions action ON action.id = progress.action_id
                JOIN roadmap_milestones milestone ON milestone.id = progress.milestone_id
                JOIN career_routes route ON route.id = milestone.route_id
                WHERE progress.id = ?
                """,
                (progress_id,),
            ).fetchone()
        return self._progress_row(dict(row))

    def list_buddy_conversations(self, employee_profile_id: int) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            rows = supabase().select(
                "career_buddy_conversations",
                {"employee_profile_id": employee_profile_id},
                order="updated_at.desc",
            )
            return [self._buddy_conversation_row(row) for row in rows]
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM career_buddy_conversations
                WHERE employee_profile_id = ?
                ORDER BY updated_at DESC, id DESC
                """,
                (employee_profile_id,),
            ).fetchall()
        return [self._buddy_conversation_row(dict(row)) for row in rows]

    def get_buddy_conversation(self, employee_profile_id: int, conversation_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            row = _first(
                supabase().select(
                    "career_buddy_conversations",
                    {"id": conversation_id, "employee_profile_id": employee_profile_id},
                    limit=1,
                )
            )
            return self._buddy_conversation_row(row) if row else None
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM career_buddy_conversations
                WHERE id = ? AND employee_profile_id = ?
                """,
                (conversation_id, employee_profile_id),
            ).fetchone()
        return self._buddy_conversation_row(dict(row)) if row else None

    def create_buddy_conversation(
        self,
        *,
        employee_profile_id: int,
        roadmap_id: int | None,
        title: str,
    ) -> dict[str, Any]:
        data = {
            "employee_profile_id": employee_profile_id,
            "roadmap_id": roadmap_id,
            "title": title,
            "status": "active",
        }
        if settings.supabase_enabled:
            return self._buddy_conversation_row(supabase().insert("career_buddy_conversations", data))
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO career_buddy_conversations (employee_profile_id, roadmap_id, title, status)
                VALUES (?, ?, ?, 'active')
                """,
                (employee_profile_id, roadmap_id, title),
            )
            row = conn.execute("SELECT * FROM career_buddy_conversations WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return self._buddy_conversation_row(dict(row))

    def list_buddy_messages(self, employee_profile_id: int, conversation_id: int) -> list[dict[str, Any]]:
        conversation = self.get_buddy_conversation(employee_profile_id, conversation_id)
        if conversation is None:
            return []
        if settings.supabase_enabled:
            rows = supabase().select(
                "career_buddy_messages",
                {"conversation_id": conversation_id},
                order="created_at.asc",
            )
            return [self._buddy_message_row(row) for row in rows]
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT * FROM career_buddy_messages
                WHERE conversation_id = ?
                ORDER BY created_at ASC, id ASC
                """,
                (conversation_id,),
            ).fetchall()
        return [self._buddy_message_row(dict(row)) for row in rows]

    def add_buddy_message(
        self,
        *,
        employee_profile_id: int,
        conversation_id: int,
        sender: str,
        content: str,
        structured_response: dict[str, Any] | None = None,
        provider: str = "template",
        model: str | None = None,
    ) -> dict[str, Any]:
        conversation = self.get_buddy_conversation(employee_profile_id, conversation_id)
        if conversation is None:
            raise ValueError("Career Buddy conversation not found")
        data = {
            "conversation_id": conversation_id,
            "sender": sender,
            "content": content,
            "structured_response_json": structured_response or {},
            "provider": provider,
            "model": model,
        }
        if settings.supabase_enabled:
            row = supabase().insert("career_buddy_messages", data)
            supabase().update("career_buddy_conversations", {"id": conversation_id}, {"updated_at": _now()})
            return self._buddy_message_row(row)
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO career_buddy_messages
                  (conversation_id, sender, content, structured_response_json, provider, model)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    conversation_id,
                    sender,
                    content,
                    json.dumps(data["structured_response_json"]),
                    provider,
                    model,
                ),
            )
            conn.execute(
                "UPDATE career_buddy_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (conversation_id,),
            )
            row = conn.execute("SELECT * FROM career_buddy_messages WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return self._buddy_message_row(dict(row))

    def count_recent_buddy_user_messages(self, employee_profile_id: int, within_minutes: int) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=within_minutes)
        if settings.supabase_enabled:
            conversations = self.list_buddy_conversations(employee_profile_id)
            total = 0
            for conversation in conversations:
                for message in self.list_buddy_messages(employee_profile_id, conversation["id"]):
                    if message["sender"] == "employee" and self._parse_timestamp(message["created_at"]) >= cutoff:
                        total += 1
            return total
        cutoff_sql = cutoff.strftime("%Y-%m-%d %H:%M:%S")
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT COUNT(*) AS count
                FROM career_buddy_messages m
                JOIN career_buddy_conversations c ON c.id = m.conversation_id
                WHERE c.employee_profile_id = ?
                  AND m.sender = 'employee'
                  AND m.created_at >= ?
                """,
                (employee_profile_id, cutoff_sql),
            ).fetchone()
        return int(row["count"])

    def _get_preferences(self, employee_profile_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            return _first(supabase().select("career_preferences", {"employee_profile_id": employee_profile_id}, limit=1))
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM career_preferences WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return dict(row) if row is not None else None

    def _get_priority_weights(self, employee_profile_id: int) -> dict[str, float]:
        if settings.supabase_enabled:
            rows = supabase().select("career_priority_weights", {"employee_profile_id": employee_profile_id})
        else:
            with get_connection() as conn:
                rows = [
                    dict(row)
                    for row in conn.execute(
                        "SELECT * FROM career_priority_weights WHERE employee_profile_id = ?",
                        (employee_profile_id,),
                    ).fetchall()
                ]
        return {row["weight_key"]: float(row["weight_value"]) for row in rows}

    def _upsert_priority_weight(self, employee_profile_id: int, key: str, label: str, value: float) -> None:
        data = {"employee_profile_id": employee_profile_id, "weight_key": key, "weight_value": value, "label": label}
        if settings.supabase_enabled:
            existing = _first(
                supabase().select(
                    "career_priority_weights",
                    {"employee_profile_id": employee_profile_id, "weight_key": key},
                    limit=1,
                )
            )
            if existing:
                supabase().update("career_priority_weights", {"id": existing["id"]}, data)
            else:
                supabase().insert("career_priority_weights", data)
            return
        with get_connection() as conn:
            existing = conn.execute(
                "SELECT id FROM career_priority_weights WHERE employee_profile_id = ? AND weight_key = ?",
                (employee_profile_id, key),
            ).fetchone()
            if existing:
                conn.execute(
                    """
                    UPDATE career_priority_weights
                    SET weight_value = ?, label = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE employee_profile_id = ? AND weight_key = ?
                    """,
                    (value, label, employee_profile_id, key),
                )
            else:
                conn.execute(
                    """
                    INSERT INTO career_priority_weights (employee_profile_id, weight_key, weight_value, label)
                    VALUES (?, ?, ?, ?)
                    """,
                    (employee_profile_id, key, value, label),
                )

    def _upsert_sqlite_preferences(self, employee_profile_id: int, data: dict[str, Any]) -> dict[str, Any]:
        with get_connection() as conn:
            existing = conn.execute(
                "SELECT id FROM career_preferences WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
            values = (
                json.dumps(data["preferred_locations_json"]),
                json.dumps(data["preferred_work_styles_json"]),
                json.dumps(data["preferred_industries_json"]),
                int(data["open_to_relocation"]),
                int(data["open_to_remote"]),
                data["risk_tolerance"],
                data["learning_budget"],
                data["preferred_company_type"],
                int(data["international_mobility"]),
                json.dumps(data["top_priorities_json"]),
                employee_profile_id,
            )
            if existing:
                conn.execute(
                    """
                    UPDATE career_preferences
                    SET preferred_locations_json = ?, preferred_work_styles_json = ?,
                        preferred_industries_json = ?, open_to_relocation = ?, open_to_remote = ?,
                        risk_tolerance = ?, learning_budget = ?, preferred_company_type = ?,
                        international_mobility = ?,
                        top_priorities_json = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE employee_profile_id = ?
                    """,
                    values,
                )
            else:
                conn.execute(
                    """
                    INSERT INTO career_preferences
                      (preferred_locations_json, preferred_work_styles_json, preferred_industries_json,
                       open_to_relocation, open_to_remote, risk_tolerance, learning_budget,
                       preferred_company_type, international_mobility, top_priorities_json, employee_profile_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    values,
                )
            row = conn.execute(
                "SELECT * FROM career_preferences WHERE employee_profile_id = ?",
                (employee_profile_id,),
            ).fetchone()
        return dict(row)

    def _onboarding_row(self, row: dict[str, Any] | None) -> dict[str, Any] | None:
        if row is None:
            return None
        data = dict(row)
        data["completed_steps"] = _json_value(data.pop("completed_steps_json", []), [])
        data["is_complete"] = _bool_value(data.get("is_complete"))
        return data

    def _goals_row(self, row: dict[str, Any] | None) -> dict[str, Any] | None:
        return dict(row) if row is not None else None

    def _lifestyle_row(self, preferences: dict[str, Any], weights: dict[str, float]) -> dict[str, Any]:
        return {
            "id": preferences.get("id"),
            "employee_profile_id": preferences["employee_profile_id"],
            "income_priority": round(weights.get("income", 0.5) * 100),
            "work_life_balance_priority": round(weights.get("work_life_balance", 0.5) * 100),
            "leadership_priority": round(weights.get("leadership", 0.5) * 100),
            "job_security_priority": round(weights.get("job_security", 0.5) * 100),
            "remote_work_priority": round(weights.get("remote_work", 0.5) * 100),
            "international_mobility": _bool_value(preferences.get("international_mobility")),
            "risk_tolerance": preferences.get("risk_tolerance") or "moderate",
            "learning_budget": preferences.get("learning_budget"),
            "preferred_company_type": preferences.get("preferred_company_type"),
            "willing_to_relocate": _bool_value(preferences.get("open_to_relocation")),
            "preferred_locations": _json_value(preferences.get("preferred_locations_json"), []),
            "preferred_work_styles": _json_value(preferences.get("preferred_work_styles_json"), []),
            "top_two_non_negotiable_priorities": _json_value(preferences.get("top_priorities_json"), []),
        }

    def _constraint_row(self, row: dict[str, Any]) -> dict[str, Any]:
        data = dict(row)
        data["value"] = _json_value(data.pop("constraint_value_json", {}), {})
        data["is_blocking"] = _bool_value(data.get("is_blocking"))
        return data

    def _buddy_conversation_row(self, row: dict[str, Any]) -> dict[str, Any]:
        return dict(row)

    def _buddy_message_row(self, row: dict[str, Any]) -> dict[str, Any]:
        data = dict(row)
        data["structured_response"] = _json_value(data.pop("structured_response_json", {}), {})
        return data

    def _progress_percent(self, status_value: str) -> float:
        if status_value == "completed":
            return 100
        if status_value == "in_progress":
            return 50
        return 0

    def _source_status(self, status_value: str) -> str:
        if status_value == "not_started":
            return "planned"
        return status_value

    def _progress_status(self, status_value: str | None) -> str:
        if status_value in {"not_started", "in_progress", "completed", "skipped"}:
            return status_value
        return "not_started"

    def _progress_row(self, row: dict[str, Any]) -> dict[str, Any]:
        data = dict(row)
        data["status"] = self._progress_status(data.get("status"))
        data["progress_percent"] = float(data.get("progress_percent") or 0)
        data["action_sequence"] = data.get("action_sequence")
        data["evidence_url"] = data.get("evidence_url")
        data["completed_at"] = data.get("completed_at")
        data["updated_at"] = data.get("updated_at")
        return data

    def _progress_rows_with_route_keys_supabase(
        self,
        roadmap_id: int,
        rows: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        if not rows:
            return []
        routes = supabase().select("career_routes", {"roadmap_id": roadmap_id}, order="sequence.asc")
        route_by_id = {route["id"]: route for route in routes}
        milestones_by_id: dict[int, dict[str, Any]] = {}
        actions_by_id: dict[int, dict[str, Any]] = {}
        for route in routes:
            milestones = supabase().select("roadmap_milestones", {"route_id": route["id"]}, order="sequence.asc")
            for milestone in milestones:
                milestones_by_id[milestone["id"]] = {**milestone, "route": route}
                actions = supabase().select("milestone_actions", {"milestone_id": milestone["id"]}, order="sequence.asc")
                for action in actions:
                    actions_by_id[action["id"]] = {**action, "milestone": milestone, "route": route}
        enriched: list[dict[str, Any]] = []
        for row in rows:
            action = actions_by_id.get(row.get("action_id"))
            milestone = milestones_by_id.get(row.get("milestone_id")) or (action or {}).get("milestone")
            route = (milestone or {}).get("route") or (action or {}).get("route")
            if not milestone or not route:
                continue
            enriched.append(
                self._progress_row(
                    {
                        **row,
                        "route_type": route["route_type"],
                        "milestone_sequence": milestone["sequence"],
                        "action_sequence": action["sequence"] if action else None,
                    }
                )
            )
        return sorted(
            enriched,
            key=lambda item: (
                route_by_id.get(milestones_by_id.get(item.get("milestone_id"), {}).get("route_id"), {}).get("sequence", 0),
                item.get("milestone_sequence") or 0,
                item.get("action_sequence") or 0,
            ),
        )

    def _upsert_progress_supabase(self, data: dict[str, Any]) -> dict[str, Any]:
        existing_rows = supabase().select(
            "roadmap_progress",
            {
                "employee_profile_id": data["employee_profile_id"],
                "roadmap_id": data["roadmap_id"],
            },
        )
        if data.get("action_id") is not None:
            existing = next((row for row in existing_rows if row.get("action_id") == data["action_id"]), None)
        else:
            existing = next(
                (
                    row
                    for row in existing_rows
                    if row.get("milestone_id") == data["milestone_id"] and row.get("action_id") is None
                ),
                None,
            )
        if existing:
            return supabase().update(
                "roadmap_progress",
                {"id": existing["id"]},
                {
                    "status": data["status"],
                    "progress_percent": data["progress_percent"],
                    "completed_at": data["completed_at"],
                    "notes": data["notes"],
                    "evidence_url": data["evidence_url"],
                },
            ) or existing
        return supabase().insert("roadmap_progress", data)

    def _update_progress_source_status_supabase(
        self,
        milestone_id: int,
        action_id: int | None,
        status_value: str,
    ) -> None:
        source_status = self._source_status(status_value)
        if action_id is not None:
            supabase().update("milestone_actions", {"id": action_id}, {"status": source_status})
        else:
            supabase().update("roadmap_milestones", {"id": milestone_id}, {"status": source_status})

    def _parse_timestamp(self, value: str) -> datetime:
        normalized = str(value).replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(normalized)
        except ValueError:
            parsed = datetime.strptime(str(value).split(".", 1)[0], "%Y-%m-%d %H:%M:%S")
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)

    def _apply_selected_route(self, snapshot: dict[str, Any], roadmap: dict[str, Any] | None) -> None:
        route_types = {
            route.get("route_type")
            for route in snapshot.get("routes", [])
            if isinstance(route, dict) and isinstance(route.get("route_type"), str)
        }
        selected = (roadmap or {}).get("selected_route_type") or snapshot.get("selected_route_type") or "recommended"
        if selected not in route_types and route_types:
            selected = "recommended" if "recommended" in route_types else sorted(route_types)[0]
        snapshot["selected_route_type"] = selected

    def _get_active_roadmap(self, employee_profile_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            return _first(
                supabase().select(
                    "career_roadmaps",
                    {"employee_profile_id": employee_profile_id, "status": "active"},
                    order="updated_at.desc",
                    limit=1,
                )
            )
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM career_roadmaps
                WHERE employee_profile_id = ? AND status = 'active'
                ORDER BY updated_at DESC, id DESC
                LIMIT 1
                """,
                (employee_profile_id,),
            ).fetchone()
        return dict(row) if row is not None else None

    def _latest_roadmap_version(self, roadmap_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            return _first(
                supabase().select(
                    "roadmap_versions",
                    {"roadmap_id": roadmap_id},
                    order="version_number.desc",
                    limit=1,
                )
            )
        with get_connection() as conn:
            row = conn.execute(
                """
                SELECT * FROM roadmap_versions
                WHERE roadmap_id = ?
                ORDER BY version_number DESC
                LIMIT 1
                """,
                (roadmap_id,),
            ).fetchone()
        return dict(row) if row is not None else None

    def _save_generated_roadmap_sqlite(
        self,
        *,
        employee_profile_id: int,
        north_star_setting_id: int | None,
        generated: dict[str, Any],
        change_summary: str,
    ) -> dict[str, Any]:
        with get_connection() as conn:
            existing = conn.execute(
                """
                SELECT * FROM career_roadmaps
                WHERE employee_profile_id = ? AND status = 'active'
                ORDER BY updated_at DESC, id DESC
                LIMIT 1
                """,
                (employee_profile_id,),
            ).fetchone()
            target_occupation_id = generated.get("target_occupation_id")
            if existing:
                roadmap_id = existing["id"]
                version_number = int(existing["current_version"]) + 1
                conn.execute("DELETE FROM roadmap_score_components WHERE roadmap_id = ?", (roadmap_id,))
                conn.execute("DELETE FROM career_routes WHERE roadmap_id = ?", (roadmap_id,))
                conn.execute(
                    """
                    UPDATE career_roadmaps
                    SET north_star_setting_id = ?, target_occupation_id = ?, title = ?, summary = ?,
                        status = 'active', current_version = ?, readiness_score_snapshot = ?,
                        fit_score_snapshot = ?, scoring_version = ?, source_label = 'deterministic_engine',
                        selected_route_type = 'recommended', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (
                        north_star_setting_id,
                        target_occupation_id,
                        generated["title"],
                        generated["summary"],
                        version_number,
                        generated["fit_score"],
                        generated["fit_score"],
                        generated["scoring_version"],
                        roadmap_id,
                    ),
                )
            else:
                version_number = 1
                cursor = conn.execute(
                    """
                    INSERT INTO career_roadmaps
                      (employee_profile_id, north_star_setting_id, target_occupation_id, title, summary,
                       status, current_version, readiness_score_snapshot, fit_score_snapshot,
                       scoring_version, source_label, selected_route_type)
                    VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, 'deterministic_engine', 'recommended')
                    """,
                    (
                        employee_profile_id,
                        north_star_setting_id,
                        target_occupation_id,
                        generated["title"],
                        generated["summary"],
                        version_number,
                        generated["fit_score"],
                        generated["fit_score"],
                        generated["scoring_version"],
                    ),
                )
                roadmap_id = cursor.lastrowid

            self._insert_sqlite_generated_children(conn, roadmap_id, generated)
            snapshot = {**generated, "roadmap_id": roadmap_id, "version": version_number, "selected_route_type": "recommended"}
            conn.execute(
                """
                INSERT INTO roadmap_versions
                  (roadmap_id, version_number, change_summary, roadmap_snapshot_json, created_by_employee_profile_id)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    roadmap_id,
                    version_number,
                    change_summary,
                    json.dumps(snapshot),
                    employee_profile_id,
                ),
            )
        return snapshot

    def _insert_sqlite_generated_children(
        self,
        conn,
        roadmap_id: int,
        generated: dict[str, Any],
    ) -> None:
        for sequence, route in enumerate(generated["routes"], start=1):
            route_cursor = conn.execute(
                """
                INSERT INTO career_routes
                  (roadmap_id, route_type, title, summary, sequence, estimated_months)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    roadmap_id,
                    route["route_type"],
                    route["title"],
                    route["summary"],
                    sequence,
                    route["estimated_months"],
                ),
            )
            route_id = route_cursor.lastrowid
            for milestone in route["milestones"]:
                milestone_cursor = conn.execute(
                    """
                    INSERT INTO roadmap_milestones
                      (route_id, title, description, sequence, duration_weeks, focus_skill_name, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'planned')
                    """,
                    (
                        route_id,
                        milestone["title"],
                        milestone["description"],
                        milestone["sequence"],
                        milestone["duration_weeks"],
                        milestone.get("focus_skill_name"),
                    ),
                )
                milestone_id = milestone_cursor.lastrowid
                for action in milestone["actions"]:
                    conn.execute(
                        """
                        INSERT INTO milestone_actions
                          (milestone_id, action_type, title, description, sequence, estimated_hours, resource_url, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'planned')
                        """,
                        (
                            milestone_id,
                            action["action_type"],
                            action["title"],
                            action.get("description"),
                            action["sequence"],
                            action.get("estimated_hours"),
                            action.get("resource_url"),
                        ),
                    )

        for component in generated["score_components"]:
            conn.execute(
                """
                INSERT INTO roadmap_score_components
                  (roadmap_id, component_key, label, score, weight, explanation, source_label)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    roadmap_id,
                    f"{component['route_type']}.{component['component_key']}",
                    component["label"],
                    component["score"],
                    component["weight"],
                    component["explanation"],
                    generated["scoring_version"],
                ),
            )

    def _save_generated_roadmap_supabase(
        self,
        *,
        employee_profile_id: int,
        north_star_setting_id: int | None,
        generated: dict[str, Any],
        change_summary: str,
    ) -> dict[str, Any]:
        client = supabase()
        existing = self._get_active_roadmap(employee_profile_id)
        target_occupation_id = generated.get("target_occupation_id")
        if existing:
            roadmap_id = existing["id"]
            version_number = int(existing["current_version"]) + 1
            client.delete("roadmap_score_components", {"roadmap_id": roadmap_id})
            client.delete("career_routes", {"roadmap_id": roadmap_id})
            client.update(
                "career_roadmaps",
                {"id": roadmap_id},
                {
                    "north_star_setting_id": north_star_setting_id,
                    "target_occupation_id": target_occupation_id,
                    "title": generated["title"],
                    "summary": generated["summary"],
                    "status": "active",
                    "current_version": version_number,
                    "readiness_score_snapshot": generated["fit_score"],
                    "fit_score_snapshot": generated["fit_score"],
                    "scoring_version": generated["scoring_version"],
                    "source_label": "deterministic_engine",
                    "selected_route_type": "recommended",
                },
            )
        else:
            version_number = 1
            roadmap = client.insert(
                "career_roadmaps",
                {
                    "employee_profile_id": employee_profile_id,
                    "north_star_setting_id": north_star_setting_id,
                    "target_occupation_id": target_occupation_id,
                    "title": generated["title"],
                    "summary": generated["summary"],
                    "status": "active",
                    "current_version": version_number,
                    "readiness_score_snapshot": generated["fit_score"],
                    "fit_score_snapshot": generated["fit_score"],
                    "scoring_version": generated["scoring_version"],
                    "source_label": "deterministic_engine",
                    "selected_route_type": "recommended",
                },
            )
            roadmap_id = roadmap["id"]

        self._insert_supabase_generated_children(client, roadmap_id, generated)
        snapshot = {**generated, "roadmap_id": roadmap_id, "version": version_number, "selected_route_type": "recommended"}
        client.insert(
            "roadmap_versions",
            {
                "roadmap_id": roadmap_id,
                "version_number": version_number,
                "change_summary": change_summary,
                "roadmap_snapshot_json": snapshot,
                "created_by_employee_profile_id": employee_profile_id,
            },
        )
        return snapshot

    def _insert_supabase_generated_children(self, client, roadmap_id: int, generated: dict[str, Any]) -> None:
        for sequence, route in enumerate(generated["routes"], start=1):
            route_row = client.insert(
                "career_routes",
                {
                    "roadmap_id": roadmap_id,
                    "route_type": route["route_type"],
                    "title": route["title"],
                    "summary": route["summary"],
                    "sequence": sequence,
                    "estimated_months": route["estimated_months"],
                },
            )
            for milestone in route["milestones"]:
                milestone_row = client.insert(
                    "roadmap_milestones",
                    {
                        "route_id": route_row["id"],
                        "title": milestone["title"],
                        "description": milestone["description"],
                        "sequence": milestone["sequence"],
                        "duration_weeks": milestone["duration_weeks"],
                        "focus_skill_name": milestone.get("focus_skill_name"),
                        "status": "planned",
                    },
                )
                for action in milestone["actions"]:
                    client.insert(
                        "milestone_actions",
                        {
                            "milestone_id": milestone_row["id"],
                            "action_type": action["action_type"],
                            "title": action["title"],
                            "description": action.get("description"),
                            "sequence": action["sequence"],
                            "estimated_hours": action.get("estimated_hours"),
                            "resource_url": action.get("resource_url"),
                            "status": "planned",
                        },
                    )
        for component in generated["score_components"]:
            client.insert(
                "roadmap_score_components",
                {
                    "roadmap_id": roadmap_id,
                    "component_key": f"{component['route_type']}.{component['component_key']}",
                    "label": component["label"],
                    "score": component["score"],
                    "weight": component["weight"],
                    "explanation": component["explanation"],
                    "source_label": generated["scoring_version"],
                },
            )
