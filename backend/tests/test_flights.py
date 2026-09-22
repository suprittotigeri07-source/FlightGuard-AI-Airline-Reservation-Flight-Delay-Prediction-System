import pytest
from app.db.seed import seed_database


@pytest.fixture(autouse=True)
def seed_test_data(db_session):
    seed_database(db_session)


def test_list_airports(client):
    response = client.get("/api/v1/airports")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 6
    codes = [a["code"] for a in data]
    assert "BLR" in codes
    assert "DEL" in codes


def test_list_airlines(client):
    response = client.get("/api/v1/airlines")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    codes = [al["code"] for al in data]
    assert "AI" in codes
    assert "6E" in codes


def test_search_flights_all(client):
    response = client.get("/api/v1/flights")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    assert len(data["items"]) >= 5


def test_search_flights_by_route(client):
    response = client.get("/api/v1/flights?origin=BLR&destination=DEL")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    numbers = [f["flight_number"] for f in data["items"]]
    assert "AI245" in numbers
    assert "6E302" in numbers


def test_search_flights_by_risk_filter(client):
    response = client.get("/api/v1/flights?risk_level=HIGH")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["delay_prediction"]["risk_level"] == "HIGH"


def test_search_flights_by_price_filter(client):
    response = client.get("/api/v1/flights?min_price=5000&max_price=7000")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert 5000 <= item["base_price"] <= 7000


def test_get_flight_details_by_id(client):
    search_resp = client.get("/api/v1/flights?origin=BLR&destination=DEL")
    flight_id = search_resp.json()["items"][0]["id"]

    detail_resp = client.get(f"/api/v1/flights/{flight_id}")
    assert detail_resp.status_code == 200
    flight = detail_resp.json()
    assert flight["id"] == flight_id
    assert flight["origin"]["code"] == "BLR"
    assert flight["destination"]["code"] == "DEL"
    assert "delay_prediction" in flight


def test_get_flight_not_found(client):
    response = client.get("/api/v1/flights/nonexistent-id-12345")
    assert response.status_code == 404
    err = response.json()["error"]
    assert err["code"] == "FLIGHT_NOT_FOUND"
