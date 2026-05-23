def product_payload(category_id):
    return {
        "name": "Лампа LED A60 12Вт E27 4000K",
        "description": "Светодиодная лампа общего назначения.",
        "category_id": category_id,
        "price": 189.0,
        "power": 12,
        "socket_type": "E27",
        "color_temp": 4000,
        "lifespan": 25000,
        "stock": 10,
    }


def test_reads_are_public(secured_client):
    assert secured_client.get("/api/products").status_code == 200
    assert secured_client.get("/api/categories").status_code == 200


def test_create_category_requires_token(secured_client):
    response = secured_client.post("/api/categories", json={"name": "LED"})
    assert response.status_code == 401


def test_create_category_invalid_token(secured_client):
    response = secured_client.post(
        "/api/categories",
        json={"name": "LED"},
        headers={"Authorization": "Bearer bad.token"},
    )
    assert response.status_code == 401


def test_create_product_requires_token(secured_client):
    response = secured_client.post("/api/products", json=product_payload(1))
    assert response.status_code == 401


def test_admin_can_create_with_token(secured_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_id = secured_client.post(
        "/api/categories", json={"name": "LED"}, headers=headers
    ).json()["id"]
    response = secured_client.post(
        "/api/products", json=product_payload(category_id), headers=headers
    )
    assert response.status_code == 201


def test_delete_requires_token(secured_client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_id = secured_client.post(
        "/api/categories", json={"name": "LED"}, headers=headers
    ).json()["id"]
    created = secured_client.post(
        "/api/products", json=product_payload(category_id), headers=headers
    ).json()
    assert secured_client.delete(f"/api/products/{created['id']}").status_code == 401
    assert (
        secured_client.delete(
            f"/api/products/{created['id']}", headers=headers
        ).status_code
        == 200
    )
