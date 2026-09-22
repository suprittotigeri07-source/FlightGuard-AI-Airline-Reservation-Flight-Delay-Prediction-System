from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.flight import FlightResponse


class PassengerCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    gender: Optional[str] = Field("M", max_length=10)
    seat_preference: Optional[str] = Field(None, max_length=10)


class PassengerResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    gender: Optional[str] = None
    seat_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReservationCreate(BaseModel):
    flight_id: str
    passengers: List[PassengerCreate] = Field(..., min_length=1, description="List of passengers for booking")


class ReservationResponse(BaseModel):
    id: str
    pnr: str
    user_id: str
    flight: FlightResponse
    total_amount: float
    status: str
    passengers: List[PassengerResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedReservationResponse(BaseModel):
    items: List[ReservationResponse]
    total: int
    page: int
    limit: int
    total_pages: int
