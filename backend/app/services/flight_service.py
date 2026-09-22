import json
import math
import random
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.flight_repository import FlightRepository
from app.models.flight import Flight
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.aircraft import Aircraft
from app.models.prediction import DelayPrediction
from app.schemas.flight import (
    FlightResponse,
    PaginatedFlightResponse,
    AirportResponse,
    AirlineResponse,
    AircraftResponse,
    PredictionResponse
)
from app.core.exceptions import FlightGuardException
from app.services.aeroapi_service import aeroapi_service, AIRLINE_META, AIRPORT_META
from app.services.ml_service import ml_service


class FlightService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FlightRepository(db)

    def _to_flight_response(self, flight) -> FlightResponse:
        duration_mins = int((flight.scheduled_arrival - flight.scheduled_departure).total_seconds() / 60)

        pred_resp = None
        if flight.delay_prediction:
            factors = []
            if flight.delay_prediction.contributing_factors_json:
                try:
                    factors = json.loads(flight.delay_prediction.contributing_factors_json)
                except Exception:
                    factors = []

            pred_resp = PredictionResponse(
                id=flight.delay_prediction.id,
                delay_probability=flight.delay_prediction.delay_probability,
                predicted_delay_minutes=flight.delay_prediction.predicted_delay_minutes,
                risk_level=flight.delay_prediction.risk_level,
                contributing_factors=factors,
                model_version=flight.delay_prediction.model_version,
                created_at=flight.delay_prediction.created_at
            )

        return FlightResponse(
            id=flight.id,
            flight_number=flight.flight_number,
            airline=AirlineResponse.model_validate(flight.airline),
            aircraft=AircraftResponse.model_validate(flight.aircraft),
            origin=AirportResponse.model_validate(flight.origin),
            destination=AirportResponse.model_validate(flight.destination),
            scheduled_departure=flight.scheduled_departure,
            scheduled_arrival=flight.scheduled_arrival,
            actual_departure=flight.actual_departure,
            actual_arrival=flight.actual_arrival,
            duration_minutes=duration_mins,
            status=flight.status,
            base_price=flight.base_price,
            available_seats=flight.available_seats,
            delay_prediction=pred_resp
        )

    def search_flights(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        departure_date: Optional[date] = None,
        airline_code: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        risk_level: Optional[str] = None,
        sort_by: str = "departure",
        page: int = 1,
        limit: int = 10
    ) -> PaginatedFlightResponse:
        items, total = self.repo.search_flights(
            origin_code=origin,
            destination_code=destination,
            departure_date=departure_date,
            airline_code=airline_code,
            min_price=min_price,
            max_price=max_price,
            risk_level=risk_level,
            sort_by=sort_by,
            page=page,
            limit=limit
        )

        flight_responses = [self._to_flight_response(f) for f in items]
        total_pages = math.ceil(total / limit) if limit > 0 else 1

        return PaginatedFlightResponse(
            items=flight_responses,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    def get_flight_by_id(self, flight_id: str) -> FlightResponse:
        flight = self.repo.get_by_id(flight_id)
        if not flight:
            raise FlightGuardException(
                code="FLIGHT_NOT_FOUND",
                message=f"Flight with ID '{flight_id}' was not found.",
                status_code=404
            )
        return self._to_flight_response(flight)

    def get_airports(self) -> List[AirportResponse]:
        airports = self.repo.get_all_airports()
        return [AirportResponse.model_validate(a) for a in airports]

    def get_airlines(self) -> List[AirlineResponse]:
        airlines = self.repo.get_all_airlines()
        return [AirlineResponse.model_validate(a) for a in airlines]

    def sync_live_flights(self, origin_code: Optional[str] = None, limit: int = 10) -> Dict[str, Any]:
        """
        Fetches live flight updates from FlightAware AeroAPI (or fallback simulation),
        upserts airlines, airports, aircraft, and flights into the database, and executes
        the XGBoost delay prediction pipeline on ingested flights.
        """
        hubs = [origin_code.upper().strip()] if origin_code else ["BLR", "DEL", "BOM", "HYD"]
        synced_flights = []
        created_count = 0
        updated_count = 0

        for hub in hubs:
            departures = aeroapi_service.fetch_airport_departures(hub, limit=limit)
            for d in departures:
                # 1. Ensure Origin Airport
                orig_code = d["origin_code"].upper()
                origin_airport = self.db.query(Airport).filter(Airport.code == orig_code).first()
                if not origin_airport:
                    meta = AIRPORT_META.get(orig_code, {"name": f"{orig_code} Airport", "city": orig_code, "country": "India"})
                    origin_airport = Airport(code=orig_code, name=meta["name"], city=meta["city"], country=meta.get("country", "India"), timezone="Asia/Kolkata")
                    self.db.add(origin_airport)
                    self.db.commit()
                    self.db.refresh(origin_airport)

                # 2. Ensure Destination Airport
                dest_code = d["destination_code"].upper()
                dest_airport = self.db.query(Airport).filter(Airport.code == dest_code).first()
                if not dest_airport:
                    meta = AIRPORT_META.get(dest_code, {"name": f"{dest_code} Airport", "city": dest_code, "country": "India"})
                    dest_airport = Airport(code=dest_code, name=meta["name"], city=meta["city"], country=meta.get("country", "India"), timezone="Asia/Kolkata")
                    self.db.add(dest_airport)
                    self.db.commit()
                    self.db.refresh(dest_airport)

                # 3. Ensure Airline
                al_code = d["airline_code"].upper()
                airline = self.db.query(Airline).filter(Airline.code == al_code).first()
                if not airline:
                    meta = AIRLINE_META.get(al_code, {"name": f"{al_code} Airlines", "country": "India"})
                    airline = Airline(code=al_code, name=meta["name"], country=meta.get("country", "India"))
                    self.db.add(airline)
                    self.db.commit()
                    self.db.refresh(airline)

                # 4. Ensure Aircraft
                model_name = d.get("aircraft_model") or "Airbus A320neo"
                tail_num = f"VT-{al_code}{random.randint(100, 999)}"
                aircraft = self.db.query(Aircraft).filter(Aircraft.airline_id == airline.id).first()
                if not aircraft:
                    aircraft = Aircraft(tail_number=tail_num, model=model_name, total_capacity=180, airline_id=airline.id)
                    self.db.add(aircraft)
                    self.db.commit()
                    self.db.refresh(aircraft)

                # 5. Check if Flight exists
                flight_number = d["flight_number"].upper().strip()
                sched_dep = d["scheduled_departure"]
                sched_arr = d["scheduled_arrival"]
                status = d.get("status") or "SCHEDULED"
                act_dep = d.get("actual_departure")
                act_arr = d.get("actual_arrival")
                dep_delay_sec = d.get("departure_delay_seconds") or 0

                existing_flight = self.db.query(Flight).filter(Flight.flight_number == flight_number).first()
                if existing_flight:
                    existing_flight.scheduled_departure = sched_dep
                    existing_flight.scheduled_arrival = sched_arr
                    existing_flight.actual_departure = act_dep
                    existing_flight.actual_arrival = act_arr
                    existing_flight.status = status
                    self.db.commit()
                    flight_obj = existing_flight
                    updated_count += 1
                else:
                    duration_mins = max(45, int((sched_arr - sched_dep).total_seconds() / 60))
                    base_fare = round(random.uniform(3500.0, 7500.0), 2)
                    flight_obj = Flight(
                        flight_number=flight_number,
                        airline_id=airline.id,
                        aircraft_id=aircraft.id,
                        origin_airport_id=origin_airport.id,
                        destination_airport_id=dest_airport.id,
                        scheduled_departure=sched_dep,
                        scheduled_arrival=sched_arr,
                        actual_departure=act_dep,
                        actual_arrival=act_arr,
                        status=status,
                        base_price=base_fare,
                        available_seats=random.randint(15, 120)
                    )
                    self.db.add(flight_obj)
                    self.db.commit()
                    self.db.refresh(flight_obj)
                    created_count += 1

                # 6. Run ML delay prediction inference
                duration_mins = max(45, int((sched_arr - sched_dep).total_seconds() / 60))
                prediction_result = ml_service.predict_delay(
                    airline_code=al_code,
                    origin_code=orig_code,
                    dest_code=dest_code,
                    scheduled_departure=sched_dep,
                    scheduled_duration_minutes=duration_mins,
                    live_departure_delay_seconds=dep_delay_sec,
                    live_status=status
                )

                if flight_obj.delay_prediction:
                    flight_obj.delay_prediction.delay_probability = prediction_result["delay_probability"]
                    flight_obj.delay_prediction.predicted_delay_minutes = prediction_result["predicted_delay_minutes"]
                    flight_obj.delay_prediction.risk_level = prediction_result["risk_level"]
                    flight_obj.delay_prediction.contributing_factors_json = json.dumps(prediction_result["contributing_factors"])
                    flight_obj.delay_prediction.model_version = prediction_result["model_version"]
                else:
                    pred = DelayPrediction(
                        flight_id=flight_obj.id,
                        delay_probability=prediction_result["delay_probability"],
                        predicted_delay_minutes=prediction_result["predicted_delay_minutes"],
                        risk_level=prediction_result["risk_level"],
                        contributing_factors_json=json.dumps(prediction_result["contributing_factors"]),
                        model_version=prediction_result["model_version"]
                    )
                    self.db.add(pred)

                self.db.commit()
                self.db.refresh(flight_obj)
                synced_flights.append(self._to_flight_response(flight_obj))

        return {
            "success": True,
            "source": "AEROAPI_LIVE" if aeroapi_service.is_configured() else "SIMULATED_LIVE",
            "message": f"Successfully synced {len(synced_flights)} flights ({created_count} new, {updated_count} updated) with AI delay predictions.",
            "total_synced": len(synced_flights),
            "created_count": created_count,
            "updated_count": updated_count,
            "flights": synced_flights
        }

    def get_live_flight_telemetry(self, ident: str) -> Dict[str, Any]:
        """
        Queries real-time live telemetry for a given flight number directly from AeroAPI.
        """
        return aeroapi_service.get_flight(ident)
