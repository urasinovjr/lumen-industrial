import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base, Admin
from app.security import hash_password

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture
def client():
    Base.metadata.create_all(engine)
    seed = TestingSessionLocal()
    seed.add(
        Admin(
            login="admin",
            password_hash=hash_password("password123"),
            name="Администратор",
        )
    )
    seed.commit()
    seed.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def auth_token(client):
    response = client.post(
        "/api/admin/login", json={"login": "admin", "password": "password123"}
    )
    return response.json()["token"]
