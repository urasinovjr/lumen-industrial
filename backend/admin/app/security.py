import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_SECRET = os.environ.get("JWT_SECRET", "lumen-dev-jwt-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_TTL_HOURS = int(os.environ.get("JWT_TTL_HOURS", "24"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_token(admin_id: int, login: str):
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=JWT_TTL_HOURS)
    payload = {
        "id": admin_id,
        "login": login,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires_at.replace(tzinfo=None)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
