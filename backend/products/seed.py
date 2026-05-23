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
        "description": "Светодиодная лампа общего назначения с нейтральным белым светом. Эквивалент лампы накаливания 100 Вт. Матовая колба.",
        "price": 189.00,
        "power": 12,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 150,
    },
    {
        "category_name": "LED",
        "name": "Лампа LED C37 7Вт E14 2700K",
        "description": "Светодиодная лампа-свеча с тёплым светом для люстр и бра.",
        "price": 145.00,
        "power": 7,
        "socket_type": "E14",
        "color_temp": 2700,
        "lifespan": 20000,
        "stock": 200,
    },
    {
        "category_name": "LED",
        "name": "Лампа LED MR16 5Вт GU10 6500K",
        "description": "Светодиодная лампа направленного света для точечных и трековых светильников.",
        "price": 210.00,
        "power": 5,
        "socket_type": "GU10",
        "color_temp": 6500,
        "lifespan": 30000,
        "stock": 85,
    },
    {
        "category_name": "LED",
        "name": "Лампа LED A70 18Вт E27 4000K",
        "description": "Мощная светодиодная лампа для больших помещений. Эквивалент лампы накаливания 150 Вт.",
        "price": 259.00,
        "power": 18,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 30000,
        "stock": 120,
    },
    {
        "category_name": "Галогенные",
        "name": "Галогенная лампа G4 20Вт 2900K",
        "description": "Капсульная галогенная лампа для мебельных и точечных светильников.",
        "price": 95.00,
        "power": 20,
        "socket_type": "G4",
        "color_temp": 2900,
        "lifespan": 2000,
        "stock": 300,
    },
    {
        "category_name": "Галогенные",
        "name": "Галогенная лампа GU10 50Вт 3000K",
        "description": "Галогенная лампа с отражателем для направленного освещения.",
        "price": 120.00,
        "power": 50,
        "socket_type": "GU10",
        "color_temp": 3000,
        "lifespan": 2000,
        "stock": 180,
    },
    {
        "category_name": "Галогенные",
        "name": "Галогенная лампа R7s 150Вт 2900K",
        "description": "Линейная галогенная лампа для прожекторов и уличных светильников.",
        "price": 240.00,
        "power": 150,
        "socket_type": "R7s",
        "color_temp": 2900,
        "lifespan": 2000,
        "stock": 60,
    },
    {
        "category_name": "Галогенные",
        "name": "Галогенная лампа E14 28Вт 2800K",
        "description": "Галогенная лампа в форме свечи с тёплым светом.",
        "price": 110.00,
        "power": 28,
        "socket_type": "E14",
        "color_temp": 2800,
        "lifespan": 2000,
        "stock": 140,
    },
    {
        "category_name": "Энергосберегающие",
        "name": "Энергосберегающая лампа E27 15Вт 4000K",
        "description": "Компактная люминесцентная лампа-спираль с нейтральным светом.",
        "price": 175.00,
        "power": 15,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 8000,
        "stock": 130,
    },
    {
        "category_name": "Энергосберегающие",
        "name": "Энергосберегающая лампа E27 20Вт 2700K",
        "description": "Энергосберегающая лампа с тёплым светом, эквивалент 100 Вт.",
        "price": 195.00,
        "power": 20,
        "socket_type": "E27",
        "color_temp": 2700,
        "lifespan": 8000,
        "stock": 110,
    },
    {
        "category_name": "Энергосберегающие",
        "name": "Энергосберегающая лампа E14 11Вт 4200K",
        "description": "Компактная лампа для небольших светильников и бра.",
        "price": 150.00,
        "power": 11,
        "socket_type": "E14",
        "color_temp": 4200,
        "lifespan": 8000,
        "stock": 160,
    },
    {
        "category_name": "Энергосберегающие",
        "name": "Энергосберегающая лампа E27 25Вт 6400K",
        "description": "U-образная лампа дневного света для офисов и мастерских.",
        "price": 230.00,
        "power": 25,
        "socket_type": "E27",
        "color_temp": 6400,
        "lifespan": 10000,
        "stock": 75,
    },
    {
        "category_name": "Филаментные",
        "name": "Филаментная лампа A60 8Вт E27 2700K",
        "description": "Светодиодная филаментная лампа в ретро-стиле с тёплым светом.",
        "price": 320.00,
        "power": 8,
        "socket_type": "E27",
        "color_temp": 2700,
        "lifespan": 15000,
        "stock": 90,
    },
    {
        "category_name": "Филаментные",
        "name": "Филаментная лампа ST64 6Вт E27 2200K",
        "description": "Декоративная филаментная лампа Эдисона с янтарным свечением.",
        "price": 390.00,
        "power": 6,
        "socket_type": "E27",
        "color_temp": 2200,
        "lifespan": 15000,
        "stock": 70,
    },
    {
        "category_name": "Филаментные",
        "name": "Филаментная лампа G95 8Вт E27 2700K",
        "description": "Крупная шарообразная филаментная лампа для открытых светильников.",
        "price": 450.00,
        "power": 8,
        "socket_type": "E27",
        "color_temp": 2700,
        "lifespan": 15000,
        "stock": 55,
    },
    {
        "category_name": "Филаментные",
        "name": "Филаментная лампа C35 5Вт E14 2700K",
        "description": "Филаментная лампа-свеча для люстр и настенных светильников.",
        "price": 280.00,
        "power": 5,
        "socket_type": "E14",
        "color_temp": 2700,
        "lifespan": 15000,
        "stock": 100,
    },
    {
        "category_name": "Умные лампы",
        "name": "Умная лампа Wi-Fi A60 9Вт E27 RGB",
        "description": "Умная лампа с управлением со смартфона: 16 млн цветов и регулировка яркости.",
        "price": 690.00,
        "power": 9,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 80,
    },
    {
        "category_name": "Умные лампы",
        "name": "Умная лампа Wi-Fi GU10 5Вт RGBW",
        "description": "Умная лампа направленного света с управлением по Wi-Fi и сценами освещения.",
        "price": 590.00,
        "power": 5,
        "socket_type": "GU10",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 95,
    },
    {
        "category_name": "Умные лампы",
        "name": "Умная лампа Zigbee A60 9Вт E27 CCT",
        "description": "Умная лампа с регулировкой температуры света, работает через хаб Zigbee.",
        "price": 650.00,
        "power": 9,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 70,
    },
    {
        "category_name": "Умные лампы",
        "name": "Умная лампа Wi-Fi E14 5Вт RGB",
        "description": "Умная лампа-свеча с цветным светом и управлением со смартфона.",
        "price": 540.00,
        "power": 5,
        "socket_type": "E14",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 110,
    },
]


def main():
    db = SessionLocal()
    try:
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
