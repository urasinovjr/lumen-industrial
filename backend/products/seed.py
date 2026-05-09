"""Заливаем начальные данные: категории и несколько товаров.

Скрипт можно запускать сколько угодно раз - дубликаты не создаются.
"""
from app.database import SessionLocal
from app.models import Category, Product


CATEGORIES = [
    "LED",
    "Галогенные",
    "Энергосберегающие",
    "Филаментные",
    "Умные лампы",
]

PRODUCTS = [
    {
        "category_name": "LED",
        "name": "Лампа LED A60 12Вт E27 4000K",
        "description": (
            "Светодиодная лампа общего назначения с нейтральным белым светом. "
            "Эквивалент лампы накаливания 100Вт. Подходит для освещения офисов, "
            "рабочих зон и жилых помещений. Матовая колба."
        ),
        "price": 189.00,
        "image_url": "/uploads/products/led-a60-12w-e27-4000k.jpg",
        "power": 12,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 150,
    },
    {
        "category_name": "LED",
        "name": "Лампа LED C37 7Вт E14 2700K",
        "description": (
            "Светодиодная лампа-свеча с тёплым белым светом. "
            "Идеально подходит для люстр и декоративных светильников."
        ),
        "price": 145.00,
        "image_url": "/uploads/products/led-c37-7w-e14-2700k.jpg",
        "power": 7,
        "socket_type": "E14",
        "color_temp": 2700,
        "lifespan": 20000,
        "stock": 200,
    },
    {
        "category_name": "LED",
        "name": "Лампа LED MR16 5Вт GU10 6500K",
        "description": (
            "Светодиодная лампа направленного света с холодным белым светом. "
            "Для точечных светильников и трековых систем."
        ),
        "price": 210.00,
        "image_url": "/uploads/products/led-mr16-5w-gu10-6500k.jpg",
        "power": 5,
        "socket_type": "GU10",
        "color_temp": 6500,
        "lifespan": 30000,
        "stock": 85,
    },
]


def main():
    db = SessionLocal()
    try:
        # Категории - создаем те, которых еще нет
        existing_cats = {}
        for c in db.query(Category).all():
            existing_cats[c.name] = c

        for name in CATEGORIES:
            if name not in existing_cats:
                cat = Category(name=name)
                db.add(cat)
                existing_cats[name] = cat
                print(f"+ категория: {name}")
        db.flush()

        # Товары
        existing_products = set()
        for p in db.query(Product).all():
            existing_products.add(p.name)

        for spec in PRODUCTS:
            if spec["name"] in existing_products:
                continue
            cat = existing_cats[spec["category_name"]]
            product = Product(
                category_id=cat.id,
                name=spec["name"],
                description=spec["description"],
                price=spec["price"],
                image_url=spec["image_url"],
                power=spec["power"],
                socket_type=spec["socket_type"],
                color_temp=spec["color_temp"],
                lifespan=spec["lifespan"],
                stock=spec["stock"],
                is_active=True,
            )
            db.add(product)
            print(f"+ товар: {spec['name']}")

        db.commit()
        print("Готово")
    finally:
        db.close()


if __name__ == "__main__":
    main()
