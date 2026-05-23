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


def override_get_db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


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
def category_id(client):
    response = client.post("/api/categories", json={"name": "LED"})
    return response.json()["id"]


@pytest.fixture
def product_payload():
    def build(category_id, **overrides):
        data = {
            "name": "Лампа LED A60 12Вт E27 4000K",
            "description": "Светодиодная лампа общего назначения.",
            "category_id": category_id,
            "price": 189.0,
            "power": 12,
            "socket_type": "E27",
            "color_temp": 4000,
            "lifespan": 25000,
            "stock": 150,
        }
        data.update(overrides)
        return data

    return build
