import os

import jwt
from fastapi import Header, HTTPException

JWT_SECRET = os.environ.get("JWT_SECRET", "lumen-dev-jwt-secret-change-me")
JWT_ALGORITHM = "HS256"


def require_admin(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    token = authorization[len("Bearer "):]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Недействительный токен")
