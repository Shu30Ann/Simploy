from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.core.supabase import supabase_auth
from backend.app.repositories.users import UserRepository

bearer = HTTPBearer(auto_error=False)
DEMO_LOGIN_EMAILS = {"abc@gmail.com", "xyz@gmail.com"}


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    if settings.supabase_enabled:
        try:
            auth_user = supabase_auth().auth_user(credentials.credentials)
        except HTTPException:
            payload = decode_access_token(credentials.credentials)
            user = UserRepository().get_by_id(int(payload["sub"]))
            if user is None or user["email"] not in DEMO_LOGIN_EMAILS:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
            return user

        user = UserRepository().get_by_supabase_id(auth_user.get("id"))
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
        return user

    payload = decode_access_token(credentials.credentials)
    user = UserRepository().get_by_id(int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    return user


def require_role(*roles: str):
    def dependency(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions")
        return user

    return dependency
