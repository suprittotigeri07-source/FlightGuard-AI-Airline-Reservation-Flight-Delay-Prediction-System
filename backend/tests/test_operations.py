import pytest
from app.db.seed import seed_database
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


@pytest.fixture(autouse=True)
def seed_data(db_session):
    seed_database(db_session)


def get_token_for_role(db_session, role_name_str: str, email: str):
    role = db_session.query(Role).filter(Role.name == role_name_str).first()
    if not role:
        role = Role(name=role_name_str, description=f"{role_name_str} role")
        db_session.add(role)
        db_session.commit()
        db_session.refresh(role)

    hashed_pw = get_password_hash("Password123!")
    user = User(
        email=email,
        hashed_password=hashed_pw,
        first_name="Op",
        last_name="User",
        role_id=role.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(subject=user.id)


def test_operations_summary_forbidden_for_passenger(client, db_session):
    token = get_token_for_role(db_session, "PASSENGER", "p1@example.com")
    resp = client.get(
        "/api/v1/operations/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403


def test_operations_summary_allowed_for_ops_agent(client, db_session):
    token = get_token_for_role(db_session, "OPERATIONS_AGENT", "ops1@example.com")
    resp = client.get(
        "/api/v1/operations/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_flights" in data
    assert "high_risk_flights_count" in data
    assert "avg_delay_probability" in data
    assert "on_time_percentage" in data
    assert data["total_flights"] > 0


def test_high_risk_flights_allowed_for_admin(client, db_session):
    token = get_token_for_role(db_session, "ADMIN", "admin1@example.com")
    resp = client.get(
        "/api/v1/operations/high-risk-flights",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    if len(items) > 0:
        item = items[0]
        assert "flight" in item
        assert "booked_passengers_count" in item
        assert "impacted_reservations_count" in item


def test_high_risk_flights_filter(client, db_session):
    token = get_token_for_role(db_session, "OPERATIONS_AGENT", "ops2@example.com")
    resp = client.get(
        "/api/v1/operations/high-risk-flights?risk_level=HIGH",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    items = resp.json()
    for item in items:
        if item["flight"]["delay_prediction"]:
            assert item["flight"]["delay_prediction"]["risk_level"] == "HIGH"
