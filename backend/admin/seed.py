from app.database import SessionLocal
from app.models import Admin
from app.security import hash_password

DEFAULT_LOGIN = "admin"
DEFAULT_PASSWORD = "password123"
DEFAULT_NAME = "Администратор"


def main():
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.login == DEFAULT_LOGIN).first()
        if existing is None:
            admin = Admin(
                login=DEFAULT_LOGIN,
                password_hash=hash_password(DEFAULT_PASSWORD),
                name=DEFAULT_NAME,
            )
            db.add(admin)
            db.commit()
            print(f"+ администратор: {DEFAULT_LOGIN}")
        else:
            print("администратор уже существует")
    finally:
        db.close()


if __name__ == "__main__":
    main()
