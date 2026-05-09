import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, Category
from app.schemas import ProductIn, ProductUpdate

router = APIRouter()

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 МБ
UPLOAD_FOLDER = "uploads/products"


def format_date(dt):
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def product_to_dict(product):
    return {
        "id": product.id,
        "category_id": product.category_id,
        "name": product.name,
        "description": product.description,
        "price": float(product.price),
        "image_url": product.image_url,
        "power": product.power,
        "socket_type": product.socket_type,
        "color_temp": product.color_temp,
        "lifespan": product.lifespan,
        "stock": product.stock,
        "is_active": product.is_active,
        "created_at": format_date(product.created_at),
        "updated_at": format_date(product.updated_at),
    }


@router.get("")
def list_products(category_id: int = None, search: str = None,
                  page: int = 1, limit: int = 10,
                  db: Session = Depends(get_db)):
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 100:
        limit = 100

    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.like(f"%{search}%"))

    total = query.count()
    items = query.order_by(Product.id).offset((page - 1) * limit).limit(limit).all()

    products = [product_to_dict(p) for p in items]
    return {"products": products, "total": total, "page": page, "limit": limit}


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product_to_dict(product)


@router.post("", status_code=201)
def create_product(body: ProductIn, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == body.category_id).first()
    if category is None:
        raise HTTPException(status_code=400, detail=f"Категория {body.category_id} не найдена")

    new_product = Product(
        category_id=body.category_id,
        name=body.name,
        description=body.description,
        price=body.price,
        image_url=body.image_url,
        power=body.power,
        socket_type=body.socket_type,
        color_temp=body.color_temp,
        lifespan=body.lifespan,
        stock=body.stock,
        is_active=True,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return product_to_dict(new_product)


@router.put("/{product_id}")
def update_product(product_id: int, body: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

    data = body.model_dump(exclude_unset=True)
    if "category_id" in data and data["category_id"] is not None:
        category = db.query(Category).filter(Category.id == data["category_id"]).first()
        if category is None:
            raise HTTPException(status_code=400, detail=f"Категория {data['category_id']} не найдена")

    for field, value in data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product_to_dict(product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.delete(product)
    db.commit()
    return {"message": "Товар удален"}


@router.post("/{product_id}/image")
def upload_image(product_id: int, file: UploadFile = File(...),
                 db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый тип файла: {file.content_type}. Разрешены: JPEG, PNG, WebP, GIF",
        )

    contents = file.file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Файл пуст")
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Файл превышает 5 МБ")

    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    ext = ext_map[file.content_type]
    filename = f"product-{product_id}-{uuid.uuid4().hex[:12]}{ext}"

    # Сохраняем
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    full_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(full_path, "wb") as f:
        f.write(contents)

    product.image_url = f"/uploads/products/{filename}"
    db.commit()
    db.refresh(product)
    return product_to_dict(product)
