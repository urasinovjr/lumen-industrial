from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cart, CartItem
from app.schemas import AddItemIn, UpdateQuantityIn
from app.products_client import get_product

router = APIRouter()


def get_session_id(x_session_id: str = Header(default=None)):
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Заголовок X-Session-Id обязателен")
    return x_session_id


def find_cart(db, session_id):
    return db.query(Cart).filter(Cart.session_id == session_id).first()


def build_cart_response(cart, db):
    if cart is None:
        return {"id": None, "items": [], "total": 0.0}

    items = []
    total = 0.0
    for item in cart.items:
        product = get_product(item.product_id)
        if product is None:
            # Товар удалили - просто пропускаем эту позицию
            continue
        price = float(product["price"])
        subtotal = price * item.quantity
        total += subtotal
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "name": product["name"],
            "price": price,
            "quantity": item.quantity,
            "subtotal": subtotal,
            "image_url": product.get("image_url"),
        })

    return {"id": cart.id, "items": items, "total": total}


@router.get("")
def get_cart(session_id: str = Depends(get_session_id), db: Session = Depends(get_db)):
    cart = find_cart(db, session_id)
    return {"cart": build_cart_response(cart, db)}


@router.post("/items", status_code=201)
def add_item(body: AddItemIn,
             session_id: str = Depends(get_session_id),
             db: Session = Depends(get_db)):
    if body.quantity <= 0:
        raise HTTPException(status_code=400, detail="Количество должно быть больше нуля")

    product = get_product(body.product_id)
    if product is None or not product.get("is_active", True):
        raise HTTPException(status_code=400, detail="Товар не найден или недоступен")

    cart = find_cart(db, session_id)
    if cart is None:
        cart = Cart(session_id=session_id)
        db.add(cart)
        db.flush()  # чтобы у cart появился id

    existing = None
    for it in cart.items:
        if it.product_id == body.product_id:
            existing = it
            break

    if existing is None:
        new_item = CartItem(cart_id=cart.id, product_id=body.product_id, quantity=body.quantity)
        db.add(new_item)
    else:
        existing.quantity += body.quantity

    db.commit()
    db.refresh(cart)
    return {"cart": build_cart_response(cart, db)}


@router.put("/items/{item_id}")
def update_item(item_id: int, body: UpdateQuantityIn,
                session_id: str = Depends(get_session_id),
                db: Session = Depends(get_db)):
    if body.quantity <= 0:
        raise HTTPException(status_code=400, detail="Количество должно быть больше нуля")

    cart = find_cart(db, session_id)
    if cart is None:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    target = None
    for it in cart.items:
        if it.id == item_id:
            target = it
            break

    if target is None:
        raise HTTPException(status_code=404, detail="Позиция корзины не найдена")

    target.quantity = body.quantity
    db.commit()
    db.refresh(cart)
    return {"cart": build_cart_response(cart, db)}


@router.delete("/items/{item_id}")
def remove_item(item_id: int,
                session_id: str = Depends(get_session_id),
                db: Session = Depends(get_db)):
    cart = find_cart(db, session_id)
    if cart is None:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    target = None
    for it in cart.items:
        if it.id == item_id:
            target = it
            break

    if target is None:
        raise HTTPException(status_code=404, detail="Позиция корзины не найдена")

    db.delete(target)
    db.commit()
    db.refresh(cart)
    return {"cart": build_cart_response(cart, db)}


@router.delete("")
def clear_cart(session_id: str = Depends(get_session_id),
               db: Session = Depends(get_db)):
    """Очистить корзину полностью."""
    cart = find_cart(db, session_id)
    if cart is None:
        return {"cart": {"id": None, "items": [], "total": 0.0}}

    for item in list(cart.items):
        db.delete(item)
    db.commit()
    db.refresh(cart)
    return {"cart": {"id": cart.id, "items": [], "total": 0.0}}
