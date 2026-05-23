def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "lumen-orders"


def test_get_cart_requires_session(client):
    response = client.get("/api/cart")
    assert response.status_code == 400


def test_get_empty_cart(client, session_headers):
    response = client.get("/api/cart", headers=session_headers)
    assert response.status_code == 200
    cart = response.json()["cart"]
    assert cart["items"] == []
    assert cart["total"] == 0.0


def test_add_item(client, session_headers):
    response = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    )
    assert response.status_code == 201
    cart = response.json()["cart"]
    assert len(cart["items"]) == 1
    item = cart["items"][0]
    assert item["product_id"] == 1
    assert item["quantity"] == 2
    assert item["subtotal"] == 378.0
    assert cart["total"] == 378.0


def test_add_item_merges_quantity(client, session_headers):
    client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    )
    response = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 3}, headers=session_headers
    )
    cart = response.json()["cart"]
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 5


def test_add_item_invalid_quantity(client, session_headers):
    response = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 0}, headers=session_headers
    )
    assert response.status_code == 400


def test_add_item_unknown_product(client, session_headers):
    response = client.post(
        "/api/cart/items", json={"product_id": 999, "quantity": 1}, headers=session_headers
    )
    assert response.status_code == 400


def test_add_item_inactive_product(client, session_headers):
    response = client.post(
        "/api/cart/items", json={"product_id": 3, "quantity": 1}, headers=session_headers
    )
    assert response.status_code == 400


def test_update_item_quantity(client, session_headers):
    add = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    ).json()
    item_id = add["cart"]["items"][0]["id"]
    response = client.put(
        f"/api/cart/items/{item_id}", json={"quantity": 7}, headers=session_headers
    )
    assert response.status_code == 200
    assert response.json()["cart"]["items"][0]["quantity"] == 7


def test_update_item_invalid_quantity(client, session_headers):
    add = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    ).json()
    item_id = add["cart"]["items"][0]["id"]
    response = client.put(
        f"/api/cart/items/{item_id}", json={"quantity": 0}, headers=session_headers
    )
    assert response.status_code == 400


def test_update_item_cart_not_found(client, session_headers):
    response = client.put(
        "/api/cart/items/1", json={"quantity": 1}, headers=session_headers
    )
    assert response.status_code == 404


def test_update_item_not_found(client, session_headers):
    client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 1}, headers=session_headers
    )
    response = client.put(
        "/api/cart/items/999", json={"quantity": 1}, headers=session_headers
    )
    assert response.status_code == 404


def test_remove_item(client, session_headers):
    add = client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    ).json()
    item_id = add["cart"]["items"][0]["id"]
    response = client.delete(f"/api/cart/items/{item_id}", headers=session_headers)
    assert response.status_code == 200
    assert response.json()["cart"]["items"] == []


def test_remove_item_not_found(client, session_headers):
    client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 1}, headers=session_headers
    )
    response = client.delete("/api/cart/items/999", headers=session_headers)
    assert response.status_code == 404


def test_clear_cart(client, session_headers):
    client.post(
        "/api/cart/items", json={"product_id": 1, "quantity": 2}, headers=session_headers
    )
    client.post(
        "/api/cart/items", json={"product_id": 2, "quantity": 1}, headers=session_headers
    )
    response = client.delete("/api/cart", headers=session_headers)
    assert response.status_code == 200
    cart = response.json()["cart"]
    assert cart["items"] == []
    assert cart["total"] == 0.0
