from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.schemas.flight import FlightResponse

class OperationsSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_flights: int
    high_risk_flights_count: int
    critical_risk_flights_count: int
    avg_delay_probability: float
    total_impacted_passengers: int
    on_time_percentage: float

class HighRiskFlightItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    flight: FlightResponse
    booked_passengers_count: int
    impacted_reservations_count: int
