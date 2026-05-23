def test_create_product(client, category_id, product_payload):
    response = client.post("/api/products", json=product_payload(category_id))
    assert response.status_code == 201
    body = response.json()
    assert body["category_id"] == category_id
    assert body["is_active"] is True
    assert body["price"] == 189.0


def test_create_product_unknown_category(client, product_payload):
    response = client.post("/api/products", json=product_payload(999))
    assert response.status_code == 400


def test_create_product_validation_error(client):
    response = client.post("/api/products", json={"name": "X"})
    assert response.status_code == 400
    assert "error" in response.json()


def test_get_product(client, category_id, product_payload):
    created = client.post("/api/products", json=product_payload(category_id)).json()
    response = client.get(f"/api/products/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_product_not_found(client):
    response = client.get("/api/products/999")
    assert response.status_code == 404


def test_list_products_pagination(client, category_id, product_payload):
    for i in range(5):
        client.post("/api/products", json=product_payload(category_id, name=f"Лампа {i}"))
    response = client.get("/api/products?page=1&limit=2")
    body = response.json()
    assert body["total"] == 5
    assert body["limit"] == 2
    assert len(body["products"]) == 2


def test_list_products_search(client, category_id, product_payload):
    client.post("/api/products", json=product_payload(category_id, name="Лампа LED A60"))
    client.post("/api/products", json=product_payload(category_id, name="Галоген MR16"))
    response = client.get("/api/products?search=LED")
    body = response.json()
    assert body["total"] == 1
    assert body["products"][0]["name"] == "Лампа LED A60"


def test_list_products_filter_category(client, product_payload):
    led = client.post("/api/categories", json={"name": "LED"}).json()["id"]
    halogen = client.post("/api/categories", json={"name": "Галогенные"}).json()["id"]
    client.post("/api/products", json=product_payload(led, name="LED 1"))
    client.post("/api/products", json=product_payload(halogen, name="Галоген 1"))
    response = client.get(f"/api/products?category_id={halogen}")
    body = response.json()
    assert body["total"] == 1
    assert body["products"][0]["category_id"] == halogen


def test_list_products_limit_clamped(client, category_id, product_payload):
    client.post("/api/products", json=product_payload(category_id))
    response = client.get("/api/products?limit=999")
    assert response.json()["limit"] == 100


def test_update_product(client, category_id, product_payload):
    created = client.post("/api/products", json=product_payload(category_id)).json()
    response = client.put(
        f"/api/products/{created['id']}", json={"price": 250.0, "stock": 10}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["price"] == 250.0
    assert body["stock"] == 10


def test_update_product_not_found(client):
    response = client.put("/api/products/999", json={"price": 1.0})
    assert response.status_code == 404


def test_update_product_unknown_category(client, category_id, product_payload):
    created = client.post("/api/products", json=product_payload(category_id)).json()
    response = client.put(f"/api/products/{created['id']}", json={"category_id": 999})
    assert response.status_code == 400


def test_delete_product(client, category_id, product_payload):
    created = client.post("/api/products", json=product_payload(category_id)).json()
    response = client.delete(f"/api/products/{created['id']}")
    assert response.status_code == 200
    assert client.get(f"/api/products/{created['id']}").status_code == 404


def test_delete_product_not_found(client):
    response = client.delete("/api/products/999")
    assert response.status_code == 404
