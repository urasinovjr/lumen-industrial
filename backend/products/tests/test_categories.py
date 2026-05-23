def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "lumen-products"


def test_create_category(client):
    response = client.post("/api/categories", json={"name": "LED"})
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "LED"
    assert "id" in body


def test_list_categories_ordered(client):
    client.post("/api/categories", json={"name": "LED"})
    client.post("/api/categories", json={"name": "Галогенные"})
    response = client.get("/api/categories")
    assert response.status_code == 200
    names = [c["name"] for c in response.json()["categories"]]
    assert names == ["LED", "Галогенные"]


def test_create_category_empty_name(client):
    response = client.post("/api/categories", json={"name": "   "})
    assert response.status_code == 400


def test_create_category_duplicate(client):
    client.post("/api/categories", json={"name": "LED"})
    response = client.post("/api/categories", json={"name": "LED"})
    assert response.status_code == 400
