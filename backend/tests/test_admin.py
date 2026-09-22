import pytest
from datetime import datetime, timedelta
from app.db.seed import seed_database
from app.models.role import Role
from app.models.user import User
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.aircraft import Aircraft
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
        first_name="Test",
        last_name=role_name_str,
        role_id=role.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(subject=user.id)


def test_admin_endpoints_forbidden_for_passenger(client, db_session):
    token = get_token_for_role(db_session, "PASSENGER", "p_admin_test@example.com")
    resp = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403


def test_admin_list_users(client, db_session):
    token = get_token_for_role(db_session, "ADMIN", "admin_list@example.com")
    resp = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    users = resp.json()
    assert isinstance(users, list)
    assert len(users) >= 1


def test_admin_update_user_role(client, db_session):
    admin_token = get_token_for_role(db_session, "ADMIN", "admin_role_mut@example.com")
    pass_user = db_session.query(User).filter(User.email == "admin_role_mut@example.com").first()

    # Create target passenger
    target_token = get_token_for_role(db_session, "PASSENGER", "target_user@example.com")
    target_user = db_session.query(User).filter(User.email == "target_user@example.com").first()

    resp = client.patch(
        f"/api/v1/admin/users/{target_user.id}/role",
        json={"role_name": "OPERATIONS_AGENT"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["role_name"] == "OPERATIONS_AGENT"


def test_admin_update_user_status(client, db_session):
    admin_token = get_token_for_role(db_session, "ADMIN", "admin_status@example.com")
    target_token = get_token_for_role(db_session, "PASSENGER", "target_deactivate@example.com")
    target_user = db_session.query(User).filter(User.email == "target_deactivate@example.com").first()

    resp = client.patch(
        f"/api/v1/admin/users/{target_user.id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


def test_admin_create_flight_and_audit(client, db_session):
    admin_token = get_token_for_role(db_session, "ADMIN", "admin_flight_creator@example.com")

    airline = db_session.query(Airline).first()
    aircraft = db_session.query(Aircraft).first()
    blr = db_session.query(Airport).filter(Airport.code == "BLR").first()
    del_ap = db_session.query(Airport).filter(Airport.code == "DEL").first()

    now = datetime.utcnow()
    payload = {
        "flight_number": "FG-9090",
        "airline_id": airline.id,
        "aircraft_id": aircraft.id,
        "origin_airport_id": blr.id,
        "destination_airport_id": del_ap.id,
        "scheduled_departure": (now + timedelta(days=1)).isoformat(),
        "scheduled_arrival": (now + timedelta(days=1, hours=3)).isoformat(),
        "base_price": 7500.0,
        "available_seats": 180
    }

    create_resp = client.post(
        "/api/v1/admin/flights",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert create_resp.status_code == 201
    flight_data = create_resp.json()
    assert flight_data["flight_number"] == "FG-9090"
    assert flight_data["delay_prediction"] is not None

    # Check Audit Log recording
    audit_resp = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
    actions = [l["action"] for l in logs]
    assert "CREATE_FLIGHT" in actions
