from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin, AdminSession
from app.schemas import LoginIn
from app.security import verify_password, create_token, decode_token

router = APIRouter()


def format_date(dt):
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def get_token(authorization: str = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    return authorization[len("Bearer "):]


def current_admin(
    token: str = Depends(get_token), db: Session = Depends(get_db)
) -> Admin:
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    session = db.query(AdminSession).filter(AdminSession.token == token).first()
    if session is None:
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    admin = db.query(Admin).filter(Admin.id == payload.get("id")).first()
    if admin is None:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    return admin


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.login == body.login).first()
    if admin is None or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    token, expires_at = create_token(admin.id, admin.login)
    db.add(AdminSession(admin_id=admin.id, token=token, expires_at=expires_at))
    db.commit()
    return {
        "token": token,
        "admin": {"id": admin.id, "login": admin.login, "name": admin.name},
    }


@router.post("/logout")
def logout(token: str = Depends(get_token), db: Session = Depends(get_db)):
    session = db.query(AdminSession).filter(AdminSession.token == token).first()
    if session is None:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    db.delete(session)
    db.commit()
    return {"message": "Сессия завершена"}


@router.get("/me")
def me(admin: Admin = Depends(current_admin)):
    return {
        "id": admin.id,
        "login": admin.login,
        "name": admin.name,
        "created_at": format_date(admin.created_at),
    }
