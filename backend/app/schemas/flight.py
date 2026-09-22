from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AirportResponse(BaseModel):
    id: str
    code: str
    name: str
    city: str
    country: str
    timezone: str

    model_config = ConfigDict(from_attributes=True)


class AirlineResponse(BaseModel):
    id: str
    code: str
    name: str
    country: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AircraftResponse(BaseModel):
    id: str
    tail_number: str
    model: str
    total_capacity: int

    model_config = ConfigDict(from_attributes=True)


class PredictionResponse(BaseModel):
    id: str
    delay_probability: float
    predicted_delay_minutes: int
    risk_level: str
    contributing_factors: List[str] = []
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlightResponse(BaseModel):
    id: str
    flight_number: str
    airline: AirlineResponse
    aircraft: AircraftResponse
    origin: AirportResponse
    destination: AirportResponse
    scheduled_departure: datetime
    scheduled_arrival: datetime
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    duration_minutes: int
    status: str
    base_price: float
    available_seats: int
    delay_prediction: Optional[PredictionResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedFlightResponse(BaseModel):
    items: List[FlightResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class LiveSyncResponse(BaseModel):
    success: bool
    source: str
    message: str
    total_synced: int
    created_count: int
    updated_count: int
    flights: List[FlightResponse] = []
