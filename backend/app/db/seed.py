import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.airline import Airline
from app.models.airport import Airport
from app.models.aircraft import Aircraft
from app.models.flight import Flight
from app.models.prediction import DelayPrediction


def seed_database(db: Session):
    # 1. Seed Airports
    airports_data = [
        {"code": "BLR", "name": "Kempegowda International Airport", "city": "Bengaluru", "country": "India", "timezone": "Asia/Kolkata"},
        {"code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi", "country": "India", "timezone": "Asia/Kolkata"},
        {"code": "BOM", "name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "country": "India", "timezone": "Asia/Kolkata"},
        {"code": "HYD", "name": "Rajiv Gandhi International Airport", "city": "Hyderabad", "country": "India", "timezone": "Asia/Kolkata"},
        {"code": "CCU", "name": "Netaji Subhash Chandra Bose International Airport", "city": "Kolkata", "country": "India", "timezone": "Asia/Kolkata"},
        {"code": "MAA", "name": "Chennai International Airport", "city": "Chennai", "country": "India", "timezone": "Asia/Kolkata"},
    ]
    airports = {}
    for a in airports_data:
        existing = db.query(Airport).filter(Airport.code == a["code"]).first()
        if not existing:
            existing = Airport(**a)
            db.add(existing)
            db.commit()
            db.refresh(existing)
        airports[a["code"]] = existing

    # 2. Seed Airlines
    airlines_data = [
        {"code": "AI", "name": "Air India", "country": "India"},
        {"code": "6E", "name": "IndiGo", "country": "India"},
        {"code": "UK", "name": "Vistara", "country": "India"},
        {"code": "SG", "name": "SpiceJet", "country": "India"},
    ]
    airlines = {}
    for al in airlines_data:
        existing = db.query(Airline).filter(Airline.code == al["code"]).first()
        if not existing:
            existing = Airline(**al)
            db.add(existing)
            db.commit()
            db.refresh(existing)
        airlines[al["code"]] = existing

    # 3. Seed Aircraft
    aircraft_data = [
        {"tail_number": "VT-EXN", "model": "Airbus A320neo", "total_capacity": 180, "airline_code": "AI"},
        {"tail_number": "VT-ISD", "model": "Airbus A321neo", "total_capacity": 222, "airline_code": "6E"},
        {"tail_number": "VT-TNB", "model": "Boeing 787-9 Dreamliner", "total_capacity": 299, "airline_code": "UK"},
        {"tail_number": "VT-SGJ", "model": "Boeing 737 MAX 8", "total_capacity": 189, "airline_code": "SG"},
    ]
    aircraft_map = {}
    for ac in aircraft_data:
        existing = db.query(Aircraft).filter(Aircraft.tail_number == ac["tail_number"]).first()
        if not existing:
            al_id = airlines[ac["airline_code"]].id
            existing = Aircraft(
                tail_number=ac["tail_number"],
                model=ac["model"],
                total_capacity=ac["total_capacity"],
                airline_id=al_id
            )
            db.add(existing)
            db.commit()
            db.refresh(existing)
        aircraft_map[ac["tail_number"]] = existing

    # 4. Seed Flights & Predictions
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    flights_seed = [
        {
            "flight_number": "AI245",
            "airline": "AI",
            "aircraft": "VT-EXN",
            "origin": "BLR",
            "destination": "DEL",
            "hours_offset": 2,
            "duration_mins": 165,
            "price": 5400.00,
            "seats": 42,
            "prob": 0.82,
            "delay_mins": 74,
            "risk": "HIGH",
            "factors": ["Previous Aircraft Arrival Delay", "Origin Departure Runway Congestion"]
        },
        {
            "flight_number": "6E302",
            "airline": "6E",
            "aircraft": "VT-ISD",
            "origin": "BLR",
            "destination": "DEL",
            "hours_offset": 5,
            "duration_mins": 160,
            "price": 4200.00,
            "seats": 88,
            "prob": 0.15,
            "delay_mins": 10,
            "risk": "LOW",
            "factors": ["Favorable Atmospheric Wind Conditions"]
        },
        {
            "flight_number": "UK812",
            "airline": "UK",
            "aircraft": "VT-TNB",
            "origin": "BLR",
            "destination": "BOM",
            "hours_offset": 3,
            "duration_mins": 105,
            "price": 6800.00,
            "seats": 24,
            "prob": 0.42,
            "delay_mins": 25,
            "risk": "MEDIUM",
            "factors": ["Destination Air Traffic Control Hold"]
        },
        {
            "flight_number": "SG501",
            "airline": "SG",
            "aircraft": "VT-SGJ",
            "origin": "DEL",
            "destination": "BOM",
            "hours_offset": 6,
            "duration_mins": 130,
            "price": 3900.00,
            "seats": 15,
            "prob": 0.89,
            "delay_mins": 95,
            "risk": "CRITICAL",
            "factors": ["Severe Ground Congestion at Delhi Hub", "Late Inbound Fleet Turnaround"]
        },
        {
            "flight_number": "AI101",
            "airline": "AI",
            "aircraft": "VT-EXN",
            "origin": "BOM",
            "destination": "BLR",
            "hours_offset": 8,
            "duration_mins": 110,
            "price": 4900.00,
            "seats": 60,
            "prob": 0.20,
            "delay_mins": 5,
            "risk": "LOW",
            "factors": ["Clear Flight Corridor"]
        },
    ]

    for f_data in flights_seed:
        dep_time = now + timedelta(hours=f_data["hours_offset"])
        arr_time = dep_time + timedelta(minutes=f_data["duration_mins"])

        existing_f = db.query(Flight).filter(Flight.flight_number == f_data["flight_number"]).first()
        if not existing_f:
            flight = Flight(
                flight_number=f_data["flight_number"],
                airline_id=airlines[f_data["airline"]].id,
                aircraft_id=aircraft_map[f_data["aircraft"]].id,
                origin_airport_id=airports[f_data["origin"]].id,
                destination_airport_id=airports[f_data["destination"]].id,
                scheduled_departure=dep_time,
                scheduled_arrival=arr_time,
                status="SCHEDULED",
                base_price=f_data["price"],
                available_seats=f_data["seats"]
            )
            db.add(flight)
            db.commit()
            db.refresh(flight)

            pred = DelayPrediction(
                flight_id=flight.id,
                delay_probability=f_data["prob"],
                predicted_delay_minutes=f_data["delay_mins"],
                risk_level=f_data["risk"],
                contributing_factors_json=json.dumps(f_data["factors"]),
                model_version="v1.0.0"
            )
            db.add(pred)
            db.commit()
