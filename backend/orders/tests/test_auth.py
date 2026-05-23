def test_list_orders_requires_token(secured_client):
    response = secured_client.get("/api/orders")
    assert response.status_code == 401


def test_list_orders_with_token(secured_client, admin_token):
    response = secured_client.get(
        "/api/orders", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200


def test_list_orders_invalid_token(secured_client):
    response = secured_client.get(
        "/api/orders", headers={"Authorization": "Bearer bad.token"}
    )
    assert response.status_code == 401


def test_update_status_requires_token(secured_client):
    response = secured_client.patch("/api/orders/1/status", json={"status": "processing"})
    assert response.status_code == 401


def test_cart_is_public(secured_client, session_headers):
    response = secured_client.get("/api/cart", headers=session_headers)
    assert response.status_code == 200


def test_create_order_is_public(secured_client, session_headers, order_body):
    secured_client.post(
        "/api/cart/items",
        json={"product_id": 1, "quantity": 2},
        headers=session_headers,
    )
    response = secured_client.post("/api/orders", json=order_body, headers=session_headers)
    assert response.status_code == 201
