import base64
import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

from backend.app.core.config import settings


class SupabaseClient:
    def __init__(self, use_service_role: bool = True) -> None:
        if not settings.supabase_url:
            raise RuntimeError("SUPABASE_URL is not configured")
        key = settings.supabase_service_role_key if use_service_role else settings.supabase_anon_key
        if not key:
            raise RuntimeError("Supabase key is not configured")
        if use_service_role and not self._is_service_key(key):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_SERVICE_ROLE_KEY must be a Supabase secret key or legacy service_role key, not the anon public key",
            )
        self.base_url = settings.supabase_url.rstrip("/")
        self.key = key

    def auth_signup(self, email: str, password: str, metadata: dict[str, Any]) -> dict[str, Any]:
        return self._request(
            "POST",
            f"{self.base_url}/auth/v1/signup",
            {"email": email, "password": password, "data": metadata},
        )

    def auth_admin_create_user(self, email: str, password: str, metadata: dict[str, Any]) -> dict[str, Any]:
        return self._request(
            "POST",
            f"{self.base_url}/auth/v1/admin/users",
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": metadata,
                "app_metadata": {"role": metadata.get("role")},
            },
        )

    def auth_admin_delete_user(self, user_id: str) -> None:
        self._request("DELETE", f"{self.base_url}/auth/v1/admin/users/{quote(user_id)}")

    def auth_login(self, email: str, password: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"{self.base_url}/auth/v1/token?grant_type=password",
            {"email": email, "password": password},
        )

    def auth_user(self, access_token: str) -> dict[str, Any]:
        return self._request(
            "GET",
            f"{self.base_url}/auth/v1/user",
            access_token=access_token,
        )

    def select(
        self,
        table: str,
        filters: dict[str, Any] | None = None,
        order: str | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"select": "*"}
        for key, value in (filters or {}).items():
            query[key] = f"eq.{value}"
        if order:
            query["order"] = order
        if limit is not None:
            query["limit"] = str(limit)
        return self._request("GET", self._rest_url(table, query))

    def insert(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        rows = self._request(
            "POST",
            self._rest_url(table, {"select": "*"}),
            payload,
            prefer="return=representation",
        )
        return rows[0]

    def update(self, table: str, filters: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any] | None:
        query = {"select": "*", **{key: f"eq.{value}" for key, value in filters.items()}}
        rows = self._request(
            "PATCH",
            self._rest_url(table, query),
            payload,
            prefer="return=representation",
        )
        return rows[0] if rows else None

    def delete(self, table: str, filters: dict[str, Any]) -> None:
        query = {key: f"eq.{value}" for key, value in filters.items()}
        self._request("DELETE", self._rest_url(table, query))

    def count(self, table: str, filters: dict[str, Any] | None = None) -> int:
        query = {"select": "id", **{key: f"eq.{value}" for key, value in (filters or {}).items()}}
        headers = self._headers(prefer="count=exact")
        request = Request(self._rest_url(table, query), headers=headers, method="GET")
        with urlopen(request, timeout=20) as response:
            content_range = response.headers.get("content-range", "")
        return int(content_range.rsplit("/", 1)[-1] or "0")

    def _rest_url(self, table: str, query: dict[str, Any]) -> str:
        return f"{self.base_url}/rest/v1/{quote(table)}?{urlencode(query)}"

    def _headers(self, access_token: str | None = None, prefer: str | None = None) -> dict[str, str]:
        bearer = access_token or self.key
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {bearer}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    def _request(
        self,
        method: str,
        url: str,
        payload: dict[str, Any] | None = None,
        *,
        access_token: str | None = None,
        prefer: str | None = None,
    ) -> Any:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(url, data=body, headers=self._headers(access_token, prefer), method=method)
        try:
            with urlopen(request, timeout=20) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except HTTPError as exc:
            raw = exc.read().decode("utf-8")
            message = raw
            try:
                parsed = json.loads(raw)
                message = parsed.get("msg") or parsed.get("message") or parsed.get("error_description") or raw
            except json.JSONDecodeError:
                pass
            raise HTTPException(status_code=self._status_code(exc.code, message), detail=message) from exc
        except (TimeoutError, URLError) as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to reach Supabase") from exc

    def _status_code(self, code: int, message: str = "") -> int:
        normalized = message.lower()
        if "rate limit" in normalized:
            return status.HTTP_429_TOO_MANY_REQUESTS
        if "invalid login" in normalized or "invalid_credentials" in normalized:
            return status.HTTP_401_UNAUTHORIZED
        if "already" in normalized or "duplicate key" in normalized:
            return status.HTTP_409_CONFLICT
        if code == 400:
            return status.HTTP_422_UNPROCESSABLE_ENTITY
        if code == 429:
            return status.HTTP_429_TOO_MANY_REQUESTS
        if code in {401, 403, 404, 409}:
            return code
        return status.HTTP_502_BAD_GATEWAY

    def _jwt_role(self, token: str) -> str | None:
        try:
            payload = token.split(".", 2)[1]
            padded = payload + "=" * (-len(payload) % 4)
            decoded = json.loads(base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8"))
            return decoded.get("role")
        except Exception:
            return None

    def _is_service_key(self, token: str) -> bool:
        if token.startswith("sb_secret_"):
            return True
        return self._jwt_role(token) == "service_role"


def supabase() -> SupabaseClient:
    return SupabaseClient(use_service_role=True)


def supabase_auth() -> SupabaseClient:
    return SupabaseClient(use_service_role=False)
