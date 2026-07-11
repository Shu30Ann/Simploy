import json
from typing import Any

from backend.app.core.config import settings
from backend.app.core.database import get_connection
from backend.app.core.supabase import supabase


class SimulationRepository:
    def create(
        self,
        employer_id: int | None,
        name: str,
        input_data: dict[str, Any],
        result_data: dict[str, Any],
        model_version: str,
    ) -> dict[str, Any]:
        if settings.supabase_enabled:
            row = supabase().insert(
                "simulations",
                {
                    "employer_id": employer_id,
                    "name": name,
                    "input_json": input_data,
                    "result_json": result_data,
                    "model_version": model_version,
                },
            )
            return self._row(row)
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO simulations (employer_id, name, input_json, result_json, model_version)
                VALUES (?, ?, ?, ?, ?)
                """,
                (employer_id, name, json.dumps(input_data), json.dumps(result_data), model_version),
            )
            row = conn.execute("SELECT * FROM simulations WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return self._row(row)

    def list(self, employer_id: int | None = None) -> list[dict[str, Any]]:
        if settings.supabase_enabled:
            filters = {"employer_id": employer_id} if employer_id is not None else None
            rows = supabase().select("simulations", filters=filters, order="created_at.desc")
            return [self._row(row) for row in rows]
        if employer_id is None:
            sql = "SELECT * FROM simulations ORDER BY created_at DESC"
            params: tuple[Any, ...] = ()
        else:
            sql = "SELECT * FROM simulations WHERE employer_id = ? ORDER BY created_at DESC"
            params = (employer_id,)
        with get_connection() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [self._row(row) for row in rows]

    def get(self, simulation_id: int) -> dict[str, Any] | None:
        if settings.supabase_enabled:
            rows = supabase().select("simulations", {"id": simulation_id}, limit=1)
            return self._row(rows[0]) if rows else None
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM simulations WHERE id = ?", (simulation_id,)).fetchone()
        return self._row(row) if row is not None else None

    def _row(self, row) -> dict[str, Any]:
        data = dict(row)
        input_data = data.pop("input_json")
        result_data = data.pop("result_json")
        data["input"] = input_data if isinstance(input_data, dict) else json.loads(input_data)
        data["result"] = result_data if isinstance(result_data, dict) else json.loads(result_data)
        return data
