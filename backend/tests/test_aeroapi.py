import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.services.aeroapi_service import aeroapi_service
from app.services.ml_service import ml_service


def test_aeroapi_service_basics():
    # Save original key
    original_key = aeroapi_service._api_key

    try:
        aeroapi_service.set_api_key("")
        assert not aeroapi_service.is_configured()
        res = aeroapi_service.test_connection()
        assert res["status"] == "UNCONFIGURED"

        # Test departure simulation fallback
        departures = aeroapi_service.fetch_airport_departures("BLR", limit=4)
        assert len(departures) == 4
        first = departures[0]
        assert first["origin_code"] == "BLR"
        assert "flight_number" in first
        assert "scheduled_departure" in first
        assert "scheduled_arrival" in first

        # Test single flight telemetry
        flight_data = aeroapi_service.get_flight("AI245")
        assert flight_data["success"] is True
        assert "data" in flight_data
    finally:
        aeroapi_service._api_key = original_key


def test_ml_prediction_service():
    now = datetime.utcnow()
    res = ml_service.predict_delay(
        airline_code="AI",
        origin_code="BLR",
        dest_code="DEL",
        scheduled_departure=now,
        scheduled_duration_minutes=150
    )
    assert "delay_probability" in res
    assert 0.0 <= res["delay_probability"] <= 1.0
    assert "risk_level" in res
    assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "predicted_delay_minutes" in res
    assert isinstance(res["contributing_factors"], list)


def test_sync_live_flights_endpoint(client: TestClient):
    response = client.post("/api/v1/flights/sync-live?origin=BLR&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_synced"] >= 1
    assert "flights" in data
    assert len(data["flights"]) >= 1

    first_flight = data["flights"][0]
    assert first_flight["origin"]["code"] == "BLR"
    assert first_flight["delay_prediction"] is not None
    assert first_flight["delay_prediction"]["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


def test_get_live_telemetry_endpoint(client: TestClient):
    response = client.get("/api/v1/flights/live/AI245")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
