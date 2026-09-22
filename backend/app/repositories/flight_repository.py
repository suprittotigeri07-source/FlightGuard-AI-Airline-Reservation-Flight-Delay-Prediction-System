from datetime import datetime, date
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, aliased
from app.models.flight import Flight
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.prediction import DelayPrediction


class FlightRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, flight_id: str) -> Optional[Flight]:
        return self.db.query(Flight).filter(Flight.id == flight_id).first()

    def get_all_airports(self) -> List[Airport]:
        return self.db.query(Airport).order_by(Airport.city.asc()).all()

    def get_all_airlines(self) -> List[Airline]:
        return self.db.query(Airline).order_by(Airline.name.asc()).all()

    def search_flights(
        self,
        origin_code: Optional[str] = None,
        destination_code: Optional[str] = None,
        departure_date: Optional[date] = None,
        airline_code: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        risk_level: Optional[str] = None,
        sort_by: str = "departure",
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[Flight], int]:
        query = self.db.query(Flight)

        # Origin airport filter with explicit alias
        if origin_code:
            origin_alias = aliased(Airport, name="origin_airports")
            query = query.join(origin_alias, Flight.origin_airport_id == origin_alias.id).filter(
                origin_alias.code == origin_code.upper().strip()
            )

        # Destination airport filter with explicit alias
        if destination_code:
            dest_alias = aliased(Airport, name="dest_airports")
            query = query.join(dest_alias, Flight.destination_airport_id == dest_alias.id).filter(
                dest_alias.code == destination_code.upper().strip()
            )

        # Departure date filter
        if departure_date:
            start_dt = datetime.combine(departure_date, datetime.min.time())
            end_dt = datetime.combine(departure_date, datetime.max.time())
            query = query.filter(Flight.scheduled_departure >= start_dt, Flight.scheduled_departure <= end_dt)

        # Airline carrier filter
        if airline_code:
            airline_alias = aliased(Airline, name="airline_carriers")
            query = query.join(airline_alias, Flight.airline_id == airline_alias.id).filter(
                airline_alias.code == airline_code.upper().strip()
            )

        # Price range filters
        if min_price is not None:
            query = query.filter(Flight.base_price >= min_price)
        if max_price is not None:
            query = query.filter(Flight.base_price <= max_price)

        # Delay risk level filter
        if risk_level:
            pred_alias = aliased(DelayPrediction, name="flight_predictions")
            query = query.join(pred_alias, Flight.id == pred_alias.flight_id).filter(
                pred_alias.risk_level == risk_level.upper().strip()
            )

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Flight.base_price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Flight.base_price.desc())
        elif sort_by == "departure":
            query = query.order_by(Flight.scheduled_departure.asc())
        elif sort_by == "risk_desc":
            if not risk_level:
                pred_alias = aliased(DelayPrediction, name="flight_predictions_sort")
                query = query.join(pred_alias, Flight.id == pred_alias.flight_id)
            query = query.order_by(pred_alias.delay_probability.desc())

        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()

        return items, total
