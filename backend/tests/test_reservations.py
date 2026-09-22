import pytest
from app.db.seed import seed_database


@pytest.fixture(autouse=True)
def seed_data(db_session):
    seed_database(db_session)


def get_auth_token(client, email="passenger.test@example.com"):
    reg_payload = {
        "email": email,
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "Passenger"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    return login_resp.json()["access_token"]


def test_create_reservation_success(client):
    token = get_auth_token(client, "user1@example.com")
    search_resp = client.get("/api/v1/flights?origin=BLR&destination=DEL")
    flight = search_resp.json()["items"][0]
    flight_id = flight["id"]
    initial_seats = flight["available_seats"]

    booking_payload = {
        "flight_id": flight_id,
        "passengers": [
            {"first_name": "Jane", "last_name": "Doe", "gender": "F"},
            {"first_name": "John", "last_name": "Doe", "gender": "M"}
        ]
    }

    res_resp = client.post(
        "/api/v1/reservations",
        json=booking_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res_resp.status_code == 201
    data = res_resp.json()
    assert len(data["pnr"]) == 6
    assert data["status"] == "CONFIRMED"
    assert len(data["passengers"]) == 2
    # Verify trusted server-side price calculation: flight.base_price * 2
    expected_total = round(flight["base_price"] * 2, 2)
    assert data["total_amount"] == expected_total

    # Verify seat count decremented
    updated_flight_resp = client.get(f"/api/v1/flights/{flight_id}")
    assert updated_flight_resp.json()["available_seats"] == initial_seats - 2


def test_create_reservation_unauthorized(client):
    search_resp = client.get("/api/v1/flights")
    flight_id = search_resp.json()["items"][0]["id"]

    res_resp = client.post("/api/v1/reservations", json={
        "flight_id": flight_id,
        "passengers": [{"first_name": "Jane", "last_name": "Doe"}]
    })
    assert res_resp.status_code == 401


def test_get_my_reservations(client):
    token = get_auth_token(client, "user2@example.com")
    search_resp = client.get("/api/v1/flights")
    flight_id = search_resp.json()["items"][0]["id"]

    client.post(
        "/api/v1/reservations",
        json={
            "flight_id": flight_id,
            "passengers": [{"first_name": "Alice", "last_name": "Smith"}]
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    my_res_resp = client.get(
        "/api/v1/reservations",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert my_res_resp.status_code == 200
    data = my_res_resp.json()
    assert data["total"] == 1
    assert data["items"][0]["passengers"][0]["first_name"] == "Alice"


def test_pnr_lookup_and_idor_protection(client):
    token_user_a = get_auth_token(client, "usera@example.com")
    token_user_b = get_auth_token(client, "userb@example.com")

    search_resp = client.get("/api/v1/flights")
    flight_id = search_resp.json()["items"][0]["id"]

    # User A creates reservation
    res_a = client.post(
        "/api/v1/reservations",
        json={
            "flight_id": flight_id,
            "passengers": [{"first_name": "Owner", "last_name": "A"}]
        },
        headers={"Authorization": f"Bearer {token_user_a}"}
    ).json()

    pnr_a = res_a["pnr"]

    # User A looks up own PNR
    lookup_resp_a = client.get(
        f"/api/v1/reservations/{pnr_a}",
        headers={"Authorization": f"Bearer {token_user_a}"}
    )
    assert lookup_resp_a.status_code == 200
    assert lookup_resp_a.json()["pnr"] == pnr_a

    # User B attempts to look up User A's PNR -> 403 IDOR Protection
    lookup_resp_b = client.get(
        f"/api/v1/reservations/{pnr_a}",
        headers={"Authorization": f"Bearer {token_user_b}"}
    )
    assert lookup_resp_b.status_code == 403


def test_cancel_reservation_restores_seats(client):
    token = get_auth_token(client, "canceller@example.com")
    search_resp = client.get("/api/v1/flights")
    flight = search_resp.json()["items"][0]
    flight_id = flight["id"]
    initial_seats = flight["available_seats"]

    # Book 1 seat
    res = client.post(
        "/api/v1/reservations",
        json={
            "flight_id": flight_id,
            "passengers": [{"first_name": "Cancel", "last_name": "Me"}]
        },
        headers={"Authorization": f"Bearer {token}"}
    ).json()

    res_id = res["id"]
    assert client.get(f"/api/v1/flights/{flight_id}").json()["available_seats"] == initial_seats - 1

    # Cancel reservation
    cancel_resp = client.post(
        f"/api/v1/reservations/{res_id}/cancel",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"

    # Verify seat restored
    assert client.get(f"/api/v1/flights/{flight_id}").json()["available_seats"] == initial_seats
