def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "lumen-admin"


def test_login_success(client):
    response = client.post(
        "/api/admin/login", json={"login": "admin", "password": "password123"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token"]
    assert body["admin"]["login"] == "admin"
    assert body["admin"]["name"] == "Администратор"


def test_login_wrong_password(client):
    response = client.post(
        "/api/admin/login", json={"login": "admin", "password": "nope"}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "Неверный логин или пароль"


def test_login_unknown_user(client):
    response = client.post(
        "/api/admin/login", json={"login": "ghost", "password": "password123"}
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/admin/me")
    assert response.status_code == 401
    assert response.json()["error"] == "Требуется авторизация"


def test_me_with_token(client, auth_token):
    response = client.get(
        "/api/admin/me", headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["login"] == "admin"
    assert body["name"] == "Администратор"


def test_me_invalid_token(client):
    response = client.get(
        "/api/admin/me", headers={"Authorization": "Bearer not.a.jwt"}
    )
    assert response.status_code == 401


def test_logout_invalidates_token(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    logout = client.post("/api/admin/logout", headers=headers)
    assert logout.status_code == 200
    assert logout.json()["message"] == "Сессия завершена"
    after = client.get("/api/admin/me", headers=headers)
    assert after.status_code == 401


def test_logout_requires_token(client):
    response = client.post("/api/admin/logout")
    assert response.status_code == 401
