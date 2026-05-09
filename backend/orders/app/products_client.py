
import os
import requests
from fastapi import HTTPException


PRODUCTS_URL = os.environ.get("PRODUCTS_SERVICE_URL", "http://localhost:3001")


def get_product(product_id):
    url = f"{PRODUCTS_URL}/api/products/{product_id}"
    try:
        response = requests.get(url, timeout=5)
    except requests.exceptions.RequestException as e:
        print(f"Не смогли достучаться до products: {e}")
        raise HTTPException(status_code=502, detail="Сервис товаров недоступен")

    if response.status_code == 404:
        return None
    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=502, detail="Сервис товаров вернул ошибку")
