import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import require_admin, JWT_SECRET, JWT_ALGORITHM
from app.database import get_db
from app.main import app
from app.models import Base

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

PRODUCTS = {
    1: {
        "id": 1,
        "name": "Лампа LED A60 12Вт E27 4000K",
        "price": 189.0,
        "image_url": "/uploads/products/led-a60.jpg",
        "is_active": True,
    },
    2: {
        "id": 2,
        "name": "Лампа LED C37 7Вт E14 2700K",
        "price": 145.0,
        "image_url": None,
        "is_active": True,
    },
    3: {
        "id": 3,
        "name": "Снятая с производства лампа",
        "price": 100.0,
        "image_url": None,
        "is_active": False,
    },
}


def override_get_db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def mock_products(monkeypatch):
    def fake_get_product(product_id):
        return PRODUCTS.get(product_id)

    monkeypatch.setattr("app.routes_cart.get_product", fake_get_product)
    monkeypatch.setattr("app.routes_orders.get_product", fake_get_product)


@pytest.fixture
def client():
    Base.metadata.create_all(engine)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_admin] = lambda: {"id": 1, "login": "admin"}
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def secured_client():
    Base.metadata.create_all(engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def admin_token():
    return jwt.encode({"id": 1, "login": "admin"}, JWT_SECRET, algorithm=JWT_ALGORITHM)


@pytest.fixture
def session_headers():
    return {"X-Session-Id": "sess-test-001"}


@pytest.fixture
def order_body():
    return {
        "customer_name": "Иванов Алексей Петрович",
        "customer_phone": "+7 (916) 123-45-67",
        "customer_email": "ivanov.ap@mail.ru",
        "delivery_city": "Москва",
        "delivery_address": "ул. Ленина, д. 15, кв. 42",
        "delivery_method": "courier",
        "payment_method": "cash",
    }
