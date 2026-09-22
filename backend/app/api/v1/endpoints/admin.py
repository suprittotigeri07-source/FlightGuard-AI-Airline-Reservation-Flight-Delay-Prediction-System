from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.models.role import Role
from app.schemas.admin import (
    UserAdminResponse,
    UserRoleUpdatePayload,
    UserStatusUpdatePayload,
    FlightCreatePayload,
    AirportCreatePayload,
    AirlineCreatePayload,
    AircraftCreatePayload,
    AuditLogResponse,
    AeroAPIStatusResponse,
    AeroAPIConfigRequest
)
from app.schemas.flight import FlightResponse, AirportResponse, AirlineResponse, AircraftResponse, LiveSyncResponse
from app.repositories.admin_repository import AdminRepository
from app.services.aeroapi_service import aeroapi_service
from app.services.flight_service import FlightService
from app.models.flight import Flight

router = APIRouter()
allow_admin_access = RoleChecker(["ADMIN"])


@router.get(
    "/users",
    response_model=List[UserAdminResponse],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def list_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all registered system users with role and activity status.
    Requires ADMIN privilege.
    """
    return AdminRepository.list_users(db, search=search)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserAdminResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def update_user_role(
    user_id: str,
    payload: UserRoleUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a target user's system role (PASSENGER, OPERATIONS_AGENT, ADMIN).
    Requires ADMIN privilege.
    """
    return AdminRepository.update_user_role(
        db, target_user_id=user_id, new_role_name=payload.role_name, admin_user_id=current_user.id
    )


@router.patch(
    "/users/{user_id}/status",
    response_model=UserAdminResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Enable or disable a target user's account active status.
    Requires ADMIN privilege.
    """
    return AdminRepository.update_user_status(
        db, target_user_id=user_id, is_active=payload.is_active, admin_user_id=current_user.id
    )


@router.get(
    "/roles",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def list_roles(db: Session = Depends(get_db)):
    """
    List available system roles.
    Requires ADMIN privilege.
    """
    roles = db.query(Role).all()
    return [r.name for r in roles]


@router.post(
    "/flights",
    response_model=FlightResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_admin_access)]
)
def create_flight(
    payload: FlightCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new scheduled flight and initialize automatic ML delay evaluation.
    Requires ADMIN privilege.
    """
    return AdminRepository.create_flight(db, payload=payload, admin_user_id=current_user.id)


@router.post(
    "/airports",
    response_model=AirportResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_admin_access)]
)
def create_airport(
    payload: AirportCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register a new airport hub in the system catalog.
    Requires ADMIN privilege.
    """
    return AdminRepository.create_airport(db, payload=payload, admin_user_id=current_user.id)


@router.post(
    "/airlines",
    response_model=AirlineResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_admin_access)]
)
def create_airline(
    payload: AirlineCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register a new airline carrier.
    Requires ADMIN privilege.
    """
    return AdminRepository.create_airline(db, payload=payload, admin_user_id=current_user.id)


@router.post(
    "/aircraft",
    response_model=AircraftResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_admin_access)]
)
def create_aircraft(
    payload: AircraftCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register a new aircraft tail number and seating capacity.
    Requires ADMIN privilege.
    """
    return AdminRepository.create_aircraft(db, payload=payload, admin_user_id=current_user.id)


@router.get(
    "/audit-logs",
    response_model=List[AuditLogResponse],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch system audit trail of administrative modifications and security events.
    Requires ADMIN privilege.
    """
    return AdminRepository.get_audit_logs(db, limit=limit)


@router.get(
    "/aeroapi/status",
    response_model=AeroAPIStatusResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def get_aeroapi_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns live connection and health status of FlightAware AeroAPI v4 integration.
    """
    is_conf = aeroapi_service.is_configured()
    masked = None
    if aeroapi_service.api_key:
        k = aeroapi_service.api_key
        masked = f"{k[:4]}...{k[-4:]}" if len(k) > 8 else "****"

    conn_check = aeroapi_service.test_connection()
    flight_count = db.query(Flight).count()

    return AeroAPIStatusResponse(
        is_configured=is_conf,
        masked_key=masked,
        base_url=aeroapi_service._base_url,
        status=conn_check["status"],
        message=conn_check["message"],
        total_flights_in_db=flight_count
    )


@router.post(
    "/aeroapi/config",
    response_model=AeroAPIStatusResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def configure_aeroapi_key(
    payload: AeroAPIConfigRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Updates the FlightAware AeroAPI key and verifies connection immediately.
    """
    new_key = payload.api_key.strip()
    aeroapi_service.set_api_key(new_key)
    conn_check = aeroapi_service.test_connection(new_key)

    AdminRepository.log_audit(
        db=db,
        user_id=current_user.id,
        action="CONFIG_AEROAPI_KEY",
        resource="AeroAPI",
        details={"status": conn_check["status"], "success": conn_check["success"]}
    )

    flight_count = db.query(Flight).count()
    masked = f"{new_key[:4]}...{new_key[-4:]}" if len(new_key) > 8 else "****"

    return AeroAPIStatusResponse(
        is_configured=bool(new_key),
        masked_key=masked,
        base_url=aeroapi_service._base_url,
        status=conn_check["status"],
        message=conn_check["message"],
        total_flights_in_db=flight_count
    )


@router.post(
    "/aeroapi/sync",
    response_model=LiveSyncResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_admin_access)]
)
def trigger_admin_aeroapi_sync(
    origin: Optional[str] = Query(None, description="Optional airport to sync"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Triggers live ingestion of flight schedules and updates ML delay predictions.
    """
    service = FlightService(db)
    result = service.sync_live_flights(origin_code=origin, limit=limit)

    AdminRepository.log_audit(
        db=db,
        user_id=current_user.id,
        action="SYNC_LIVE_FLIGHTS",
        resource="AeroAPI",
        details={"total_synced": result["total_synced"], "source": result["source"]}
    )

    return result

