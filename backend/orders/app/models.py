from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, DECIMAL, Text,
    ForeignKey, UniqueConstraint, Enum,
)
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()

DELIVERY_METHODS = ("pickup", "courier")
PAYMENT_METHODS = ("card_online", "cash")
ORDER_STATUSES = ("new", "processing", "shipped", "delivered", "cancelled")

DELIVERY_PRICES = {"pickup": 0, "courier": 1450}


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship(
        "CartItem", back_populates="cart",
        cascade="all, delete-orphan", order_by="CartItem.id",
    )


class CartItem(Base):

    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),
    )

    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cart = relationship("Cart", back_populates="items")


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    order_number = Column(String(20), nullable=False, unique=True)

    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(255), nullable=False)

    delivery_city = Column(String(255), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_method = Column(Enum(*DELIVERY_METHODS, name="delivery_method"), nullable=False)

    payment_method = Column(Enum(*PAYMENT_METHODS, name="payment_method"), nullable=False)

    status = Column(Enum(*ORDER_STATUSES, name="order_status"), nullable=False, default="new")
    total_amount = Column(DECIMAL(10, 2), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship(
        "OrderItem", back_populates="order",
        cascade="all, delete-orphan", order_by="OrderItem.id",
    )


class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    product_price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
