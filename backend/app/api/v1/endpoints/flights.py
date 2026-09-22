from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.flight import (
    FlightResponse,
    PaginatedFlightResponse,
    AirportResponse,
    AirlineResponse,
    LiveSyncResponse
)
from app.services.flight_service import FlightService

router = APIRouter()


@router.get("/flights", response_model=PaginatedFlightResponse, summary="Search Flights")
def search_flights(
    origin: Optional[str] = Query(None, description="Origin airport IATA code (e.g. BLR)"),
    destination: Optional[str] = Query(None, description="Destination airport IATA code (e.g. DEL)"),
    departure_date: Optional[date] = Query(None, description="Departure date (YYYY-MM-DD)"),
    airline_code: Optional[str] = Query(None, description="Airline IATA code (e.g. AI, 6E)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum base fare"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum base fare"),
    risk_level: Optional[str] = Query(None, description="Delay risk level: LOW, MEDIUM, HIGH, CRITICAL"),
    sort_by: str = Query("departure", description="Sorting option: departure, price_asc, price_desc, risk_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    service = FlightService(db)
    return service.search_flights(
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        airline_code=airline_code,
        min_price=min_price,
        max_price=max_price,
        risk_level=risk_level,
        sort_by=sort_by,
        page=page,
        limit=limit
    )


@router.post("/flights/sync-live", response_model=LiveSyncResponse, summary="Sync Live Flights from AeroAPI")
def sync_live_flights(
    origin: Optional[str] = Query(None, description="Hub airport code to sync (default: all major Indian hubs)"),
    limit: int = Query(10, ge=1, le=50, description="Max departures per hub"),
    db: Session = Depends(get_db)
):
    """
    Triggers live flight ingestion from FlightAware AeroAPI (or simulation fallback).
    Upserts flights, runs ML delay prediction inference, and updates operations dashboard.
    """
    service = FlightService(db)
    return service.sync_live_flights(origin_code=origin, limit=limit)


@router.get("/flights/live/{ident}", summary="Get Live Flight Radar & Telemetry by Ident")
def get_live_flight_telemetry(ident: str, db: Session = Depends(get_db)):
    """
    Fetches real-time live flight status and telemetry from AeroAPI by flight ident.
    """
    service = FlightService(db)
    return service.get_live_flight_telemetry(ident)


@router.get("/flights/{flight_id}", response_model=FlightResponse, summary="Get Flight Details by ID")
def get_flight_by_id(flight_id: str, db: Session = Depends(get_db)):
    service = FlightService(db)
    return service.get_flight_by_id(flight_id)


@router.get("/airports", response_model=List[AirportResponse], summary="List Airports")
def list_airports(db: Session = Depends(get_db)):
    service = FlightService(db)
    return service.get_airports()


@router.get("/airlines", response_model=List[AirlineResponse], summary="List Airlines")
def list_airlines(db: Session = Depends(get_db)):
    service = FlightService(db)
    return service.get_airlines()
