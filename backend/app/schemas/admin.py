from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class UserAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    first_name: str
    last_name: str
    role_name: str
    is_active: bool
    created_at: datetime


class UserRoleUpdatePayload(BaseModel):
    role_name: str = Field(..., description="Target role: PASSENGER, OPERATIONS_AGENT, ADMIN")


class UserStatusUpdatePayload(BaseModel):
    is_active: bool


class FlightCreatePayload(BaseModel):
    flight_number: str
    airline_id: str
    aircraft_id: str
    origin_airport_id: str
    destination_airport_id: str
    scheduled_departure: datetime
    scheduled_arrival: datetime
    base_price: float = Field(..., gt=0)
    available_seats: Optional[int] = None


class FlightUpdatePayload(BaseModel):
    scheduled_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    base_price: Optional[float] = None
    status: Optional[str] = None


class AirportCreatePayload(BaseModel):
    code: str = Field(..., min_length=3, max_length=5)
    name: str
    city: str
    country: str = "India"
    timezone: str = "Asia/Kolkata"


class AirlineCreatePayload(BaseModel):
    code: str = Field(..., min_length=2, max_length=5)
    name: str
    country: Optional[str] = "India"


class AircraftCreatePayload(BaseModel):
    tail_number: str
    model: str
    total_capacity: int = Field(..., gt=0)
    airline_id: str


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_email: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    details_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime


class AeroAPIStatusResponse(BaseModel):
    is_configured: bool
    masked_key: Optional[str] = None
    base_url: str
    status: str
    message: str
    total_flights_in_db: int


class AeroAPIConfigRequest(BaseModel):
    api_key: str
