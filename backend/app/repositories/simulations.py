import json
from typing import Any

from backend.app.core.database import get_connection


class SimulationRepository:
    def create(
        self,
        employer_id: int | None,
        name: str,
        input_data: dict[str, Any],
        result_data: dict[str, Any],
        model_version: str,
    ) -> dict[str, Any]:
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
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM simulations WHERE id = ?", (simulation_id,)).fetchone()
        return self._row(row) if row is not None else None

    def _row(self, row) -> dict[str, Any]:
        data = dict(row)
        data["input"] = json.loads(data.pop("input_json"))
        data["result"] = json.loads(data.pop("result_json"))
        return data
