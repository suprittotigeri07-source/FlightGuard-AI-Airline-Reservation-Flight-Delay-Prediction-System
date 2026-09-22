def test_register_user_success(client):
    payload = {
        "email": "jane.passenger@example.com",
        "password": "SecurePassword123!",
        "first_name": "Jane",
        "last_name": "Doe"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "jane.passenger@example.com"
    assert data["first_name"] == "Jane"
    assert data["last_name"] == "Doe"
    assert data["role"] == "PASSENGER"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "first_name": "John",
        "last_name": "Doe"
    }
    resp1 = client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 400
    err = resp2.json()["error"]
    assert err["code"] == "EMAIL_ALREADY_REGISTERED"


def test_register_weak_password(client):
    payload = {
        "email": "weak@example.com",
        "password": "short",
        "first_name": "Short",
        "last_name": "Pass"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client):
    reg_payload = {
        "email": "login.user@example.com",
        "password": "ValidPassword123!",
        "first_name": "Alice",
        "last_name": "Smith"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "login.user@example.com",
        "password": "ValidPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login.user@example.com"
    assert data["user"]["role"] == "PASSENGER"


def test_login_invalid_credentials(client):
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    err = response.json()["error"]
    assert err["code"] == "INVALID_CREDENTIALS"


def test_get_me_endpoint(client):
    reg_payload = {
        "email": "me.user@example.com",
        "password": "ValidPassword123!",
        "first_name": "Bob",
        "last_name": "Jones"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = client.post("/api/v1/auth/login", json={
        "email": "me.user@example.com",
        "password": "ValidPassword123!"
    })
    token = login_resp.json()["access_token"]

    # Request /auth/me with Bearer token
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    data = me_resp.json()
    assert data["email"] == "me.user@example.com"
    assert data["first_name"] == "Bob"
    assert data["last_name"] == "Jones"


def test_unauthorized_access_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
