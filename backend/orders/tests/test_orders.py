import re


def add_to_cart(client, session_headers, product_id=1, quantity=2):
    return client.post(
        "/api/cart/items",
        json={"product_id": product_id, "quantity": quantity},
        headers=session_headers,
    )


def test_create_order(client, session_headers, order_body):
    add_to_cart(client, session_headers, product_id=1, quantity=2)
    add_to_cart(client, session_headers, product_id=2, quantity=1)
    response = client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 201
    body = response.json()
    assert re.match(r"^ORD-\d{8}-\d{4}$", body["order_number"])
    assert body["status"] == "new"
    assert body["payment_method"] == "cash"
    assert body["total"] == 523.0
    assert len(body["items"]) == 2
    cart = client.get("/api/cart", headers=session_headers).json()["cart"]
    assert cart["items"] == []


def test_create_order_empty_cart(client, session_headers, order_body):
    response = client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 400


def test_create_order_invalid_delivery(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    order_body["delivery_method"] = "teleport"
    response = client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 400


def test_create_order_invalid_payment(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    order_body["payment_method"] = "bitcoin"
    response = client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 400


def test_create_order_invalid_email(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    order_body["customer_email"] = "no-at-sign"
    response = client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 400


def test_get_order_by_number(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    created = client.post("/api/orders", json=order_body, headers=session_headers).json()
    response = client.get(f"/api/orders/{created['order_number']}")
    assert response.status_code == 200
    assert response.json()["order_number"] == created["order_number"]


def test_get_order_not_found(client):
    response = client.get("/api/orders/ORD-00000000-9999")
    assert response.status_code == 404


def test_list_orders_and_filter(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    client.post("/api/orders", json=order_body, headers=session_headers)
    response = client.get("/api/orders")
    body = response.json()
    assert body["total"] == 1
    assert body["orders"][0]["status"] == "new"
    assert client.get("/api/orders?status=new").json()["total"] == 1
    assert client.get("/api/orders?status=delivered").json()["total"] == 0


def test_list_orders_invalid_status(client):
    response = client.get("/api/orders?status=unknown")
    assert response.status_code == 400


def test_update_order_status(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    created = client.post("/api/orders", json=order_body, headers=session_headers).json()
    response = client.patch(
        f"/api/orders/{created['id']}/status", json={"status": "processing"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "processing"


def test_update_order_status_invalid(client, session_headers, order_body):
    add_to_cart(client, session_headers)
    created = client.post("/api/orders", json=order_body, headers=session_headers).json()
    response = client.patch(
        f"/api/orders/{created['id']}/status", json={"status": "unknown"}
    )
    assert response.status_code == 400


def test_update_order_status_not_found(client):
    response = client.patch("/api/orders/999/status", json={"status": "processing"})
    assert response.status_code == 404
