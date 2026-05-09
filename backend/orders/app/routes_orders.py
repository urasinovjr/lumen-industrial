from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Cart, Order, OrderItem,
    DELIVERY_METHODS, PAYMENT_METHODS, ORDER_STATUSES,
)
from app.schemas import CreateOrderIn, UpdateStatusIn
from app.products_client import get_product
from app.routes_cart import get_session_id

router = APIRouter()


def format_date(dt):
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def order_to_dict(order):
    items = []
    for it in order.items:
        items.append({
            "product_id": it.product_id,
            "name": it.product_name,
            "price": float(it.product_price),
            "quantity": it.quantity,
            "subtotal": float(it.product_price) * it.quantity,
        })
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "customer_email": order.customer_email,
        "delivery_city": order.delivery_city,
        "delivery_address": order.delivery_address,
        "delivery_method": order.delivery_method,
        "payment_method": order.payment_method,
        "items": items,
        "total": float(order.total_amount),
        "created_at": format_date(order.created_at),
        "updated_at": format_date(order.updated_at),
    }


def order_summary_dict(order):
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "customer_email": order.customer_email,
        "delivery_city": order.delivery_city,
        "delivery_method": order.delivery_method,
        "payment_method": order.payment_method,
        "total": float(order.total_amount),
        "created_at": format_date(order.created_at),
    }


def generate_order_number(db):
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"ORD-{today}-"

    last = (
        db.query(Order)
          .filter(Order.order_number.like(f"{prefix}%"))
          .order_by(Order.order_number.desc())
          .first()
    )
    if last is None:
        n = 1
    else:
        try:
            n = int(last.order_number.split("-")[-1]) + 1
        except ValueError:
            n = 1
    return f"{prefix}{n:04d}"


@router.post("", status_code=201)
def create_order(body: CreateOrderIn,
                 session_id: str = Depends(get_session_id),
                 db: Session = Depends(get_db)):
    if body.delivery_method not in DELIVERY_METHODS:
        raise HTTPException(
            status_code=400,
            detail=f"Способ доставки должен быть одним из: {', '.join(DELIVERY_METHODS)}",
        )
    if body.payment_method not in PAYMENT_METHODS:
        raise HTTPException(
            status_code=400,
            detail=f"Способ оплаты должен быть одним из: {', '.join(PAYMENT_METHODS)}",
        )

    if "@" not in body.customer_email:
        raise HTTPException(status_code=400, detail="Невалидный email")

    cart = db.query(Cart).filter(Cart.session_id == session_id).first()
    if cart is None or len(cart.items) == 0:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    total = 0.0
    snapshot_items = []
    for cart_item in cart.items:
        product = get_product(cart_item.product_id)
        if product is None or not product.get("is_active", True):
            raise HTTPException(
                status_code=400,
                detail=f"Товар {cart_item.product_id} недоступен",
            )
        price = float(product["price"])
        subtotal = price * cart_item.quantity
        total += subtotal
        snapshot_items.append(OrderItem(
            product_id=cart_item.product_id,
            product_name=product["name"],
            product_price=price,
            quantity=cart_item.quantity,
        ))

    new_order = Order(
        order_number=generate_order_number(db),
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        customer_email=body.customer_email,
        delivery_city=body.delivery_city,
        delivery_address=body.delivery_address,
        delivery_method=body.delivery_method,
        payment_method=body.payment_method,
        status="new",
        total_amount=total,
        items=snapshot_items,
    )
    db.add(new_order)

    for item in list(cart.items):
        db.delete(item)

    db.commit()
    db.refresh(new_order)
    return order_to_dict(new_order)


@router.get("/{order_number}")
def get_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order_to_dict(order)


@router.get("")
def list_orders(status: str = None, page: int = 1, limit: int = 10,
                db: Session = Depends(get_db)):
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    if limit > 100:
        limit = 100

    query = db.query(Order)
    if status is not None:
        if status not in ORDER_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Статус должен быть одним из: {', '.join(ORDER_STATUSES)}",
            )
        query = query.filter(Order.status == status)

    total = query.count()
    rows = query.order_by(Order.id.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "orders": [order_summary_dict(o) for o in rows],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.patch("/{order_id}/status")
def update_status(order_id: int, body: UpdateStatusIn,
                  db: Session = Depends(get_db)):
    if body.status not in ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Статус должен быть одним из: {', '.join(ORDER_STATUSES)}",
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    order.status = body.status
    db.commit()
    db.refresh(order)
    return order_to_dict(order)
