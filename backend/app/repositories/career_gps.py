import json
from datetime import datetime, timezone
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
