from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Category
from app.schemas import CategoryIn
from app.auth import require_admin

router = APIRouter()


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Category).order_by(Category.id).all()
    result = [{"id": c.id, "name": c.name} for c in rows]
    return {"categories": result}


@router.post("", status_code=201)
def create_category(
    body: CategoryIn,
    db: Session = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Название не может быть пустым")

    new_cat = Category(name=name)
    db.add(new_cat)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Категория с таким названием уже существует")
    db.refresh(new_cat)
    return {"id": new_cat.id, "name": new_cat.name}
