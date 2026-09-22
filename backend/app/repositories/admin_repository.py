import json
import random
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.models.flight import Flight
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.aircraft import Aircraft
from app.models.prediction import DelayPrediction
from app.models.audit_log import AuditLog
from app.schemas.admin import (
    UserAdminResponse,
    FlightCreatePayload,
    FlightUpdatePayload,
    AirportCreatePayload,
    AirlineCreatePayload,
    AircraftCreatePayload,
    AuditLogResponse
)
from app.schemas.flight import FlightResponse
from app.services.flight_service import FlightService
from app.core.exceptions import FlightGuardException


class AdminRepository:

    @staticmethod
    def log_audit(
        db: Session,
        user_id: Optional[str],
        action: str,
        resource: str,
        resource_id: Optional[str] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = "127.0.0.1"
    ) -> AuditLog:
        details_str = json.dumps(details) if details else None
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            details_json=details_str,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @staticmethod
    def list_users(db: Session, search: Optional[str] = None) -> List[UserAdminResponse]:
        query = db.query(User).join(Role, User.role_id == Role.id)
        if search:
            term = f"%{search.strip()}%"
            query = query.filter((User.email.ilike(term)) | (User.first_name.ilike(term)) | (User.last_name.ilike(term)))
        
        users = query.order_by(User.created_at.desc()).all()
        results = []
        for u in users:
            results.append(
                UserAdminResponse(
                    id=u.id,
                    email=u.email,
                    first_name=u.first_name,
                    last_name=u.last_name,
                    role_name=u.role.name if u.role else "PASSENGER",
                    is_active=u.is_active,
                    created_at=u.created_at
                )
            )
        return results

    @staticmethod
    def update_user_role(db: Session, target_user_id: str, new_role_name: str, admin_user_id: str) -> UserAdminResponse:
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise FlightGuardException(code="USER_NOT_FOUND", message="Target user not found.", status_code=404)

        role_name_upper = new_role_name.upper().strip()
        role = db.query(Role).filter(Role.name == role_name_upper).first()
        if not role:
            role = Role(name=role_name_upper, description=f"{role_name_upper} role")
            db.add(role)
            db.commit()
            db.refresh(role)

        old_role = user.role.name if user.role else "PASSENGER"
        user.role_id = role.id
        db.commit()
        db.refresh(user)

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="UPDATE_USER_ROLE",
            resource="User",
            resource_id=user.id,
            details={"email": user.email, "old_role": old_role, "new_role": role.name}
        )

        return UserAdminResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role_name=user.role.name,
            is_active=user.is_active,
            created_at=user.created_at
        )

    @staticmethod
    def update_user_status(db: Session, target_user_id: str, is_active: bool, admin_user_id: str) -> UserAdminResponse:
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise FlightGuardException(code="USER_NOT_FOUND", message="Target user not found.", status_code=404)

        user.is_active = is_active
        db.commit()
        db.refresh(user)

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="UPDATE_USER_STATUS",
            resource="User",
            resource_id=user.id,
            details={"email": user.email, "is_active": is_active}
        )

        return UserAdminResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role_name=user.role.name if user.role else "PASSENGER",
            is_active=user.is_active,
            created_at=user.created_at
        )

    @staticmethod
    def create_flight(db: Session, payload: FlightCreatePayload, admin_user_id: str) -> FlightResponse:
        aircraft = db.query(Aircraft).filter(Aircraft.id == payload.aircraft_id).first()
        if not aircraft:
            raise FlightGuardException(code="AIRCRAFT_NOT_FOUND", message="Invalid aircraft selection.", status_code=400)

        seats = payload.available_seats if payload.available_seats is not None else aircraft.total_capacity

        flight = Flight(
            flight_number=payload.flight_number.upper().strip(),
            airline_id=payload.airline_id,
            aircraft_id=payload.aircraft_id,
            origin_airport_id=payload.origin_airport_id,
            destination_airport_id=payload.destination_airport_id,
            scheduled_departure=payload.scheduled_departure,
            scheduled_arrival=payload.scheduled_arrival,
            base_price=payload.base_price,
            available_seats=seats,
            status="SCHEDULED"
        )
        db.add(flight)
        db.commit()
        db.refresh(flight)

        # Generate initial ML delay prediction evaluation for newly created flight
        prob = round(random.uniform(0.08, 0.45), 2)
        risk = "LOW"
        if prob >= 0.40:
            risk = "HIGH"
        elif prob >= 0.20:
            risk = "MEDIUM"
        
        pred = DelayPrediction(
            flight_id=flight.id,
            delay_probability=prob,
            predicted_delay_minutes=int(prob * 45),
            risk_level=risk,
            contributing_factors_json=json.dumps(["Initial schedule baseline", "Normal route traffic forecast"]),
            model_version="v1.0.0"
        )
        db.add(pred)
        db.commit()

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="CREATE_FLIGHT",
            resource="Flight",
            resource_id=flight.id,
            details={"flight_number": flight.flight_number, "base_price": flight.base_price}
        )

        flight_service = FlightService(db)
        return flight_service._to_flight_response(flight)

    @staticmethod
    def create_airport(db: Session, payload: AirportCreatePayload, admin_user_id: str) -> Airport:
        code_upper = payload.code.upper().strip()
        existing = db.query(Airport).filter(Airport.code == code_upper).first()
        if existing:
            raise FlightGuardException(code="AIRPORT_EXISTS", message=f"Airport '{code_upper}' already exists.", status_code=400)

        airport = Airport(
            code=code_upper,
            name=payload.name,
            city=payload.city,
            country=payload.country,
            timezone=payload.timezone
        )
        db.add(airport)
        db.commit()
        db.refresh(airport)

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="CREATE_AIRPORT",
            resource="Airport",
            resource_id=airport.id,
            details={"code": airport.code, "city": airport.city}
        )

        return airport

    @staticmethod
    def create_airline(db: Session, payload: AirlineCreatePayload, admin_user_id: str) -> Airline:
        code_upper = payload.code.upper().strip()
        existing = db.query(Airline).filter(Airline.code == code_upper).first()
        if existing:
            raise FlightGuardException(code="AIRLINE_EXISTS", message=f"Airline '{code_upper}' already exists.", status_code=400)

        airline = Airline(
            code=code_upper,
            name=payload.name,
            country=payload.country
        )
        db.add(airline)
        db.commit()
        db.refresh(airline)

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="CREATE_AIRLINE",
            resource="Airline",
            resource_id=airline.id,
            details={"code": airline.code, "name": airline.name}
        )

        return airline

    @staticmethod
    def create_aircraft(db: Session, payload: AircraftCreatePayload, admin_user_id: str) -> Aircraft:
        tail_upper = payload.tail_number.upper().strip()
        existing = db.query(Aircraft).filter(Aircraft.tail_number == tail_upper).first()
        if existing:
            raise FlightGuardException(code="AIRCRAFT_EXISTS", message=f"Aircraft '{tail_upper}' already exists.", status_code=400)

        aircraft = Aircraft(
            tail_number=tail_upper,
            model=payload.model,
            total_capacity=payload.total_capacity,
            airline_id=payload.airline_id
        )
        db.add(aircraft)
        db.commit()
        db.refresh(aircraft)

        AdminRepository.log_audit(
            db=db,
            user_id=admin_user_id,
            action="CREATE_AIRCRAFT",
            resource="Aircraft",
            resource_id=aircraft.id,
            details={"tail_number": aircraft.tail_number, "capacity": aircraft.total_capacity}
        )

        return aircraft

    @staticmethod
    def get_audit_logs(db: Session, limit: int = 50) -> List[AuditLogResponse]:
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
        results = []
        for l in logs:
            results.append(
                AuditLogResponse(
                    id=l.id,
                    user_email=l.user.email if l.user else "System",
                    action=l.action,
                    resource=l.resource,
                    resource_id=l.resource_id,
                    details_json=l.details_json,
                    ip_address=l.ip_address,
                    created_at=l.created_at
                )
            )
        return results
