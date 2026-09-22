from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func
from app.models.flight import Flight
from app.models.prediction import DelayPrediction
from app.models.reservation import Reservation
from app.models.passenger import Passenger
from app.models.airport import Airport
from app.schemas.operations import OperationsSummary, HighRiskFlightItem
from app.schemas.flight import FlightResponse


class OperationsRepository:

    @staticmethod
    def get_operations_summary(db: Session) -> OperationsSummary:
        flights = db.query(Flight).all()
        total_flights = len(flights)
        if total_flights == 0:
            return OperationsSummary(
                total_flights=0,
                high_risk_flights_count=0,
                critical_risk_flights_count=0,
                avg_delay_probability=0.0,
                total_impacted_passengers=0,
                on_time_percentage=100.0,
            )

        high_risk_count = 0
        critical_risk_count = 0
        prob_sum = 0.0
        prob_count = 0
        high_risk_flight_ids = set()

        for f in flights:
            if f.delay_prediction:
                prob = f.delay_prediction.delay_probability
                risk = f.delay_prediction.risk_level
                prob_sum += prob
                prob_count += 1
                if risk == "CRITICAL" or prob >= 0.70:
                    critical_risk_count += 1
                    high_risk_count += 1
                    high_risk_flight_ids.add(f.id)
                elif risk == "HIGH" or prob >= 0.40:
                    high_risk_count += 1
                    high_risk_flight_ids.add(f.id)

        avg_prob = (prob_sum / prob_count) if prob_count > 0 else 0.0
        on_time_pct = round(((total_flights - high_risk_count) / total_flights) * 100.0, 1)

        # Count impacted passengers for high risk flights
        total_impacted_passengers = 0
        if high_risk_flight_ids:
            total_impacted_passengers = (
                db.query(func.count(Passenger.id))
                .join(Reservation, Passenger.reservation_id == Reservation.id)
                .filter(
                    Reservation.flight_id.in_(list(high_risk_flight_ids)),
                    Reservation.status == "CONFIRMED",
                )
                .scalar() or 0
            )

        return OperationsSummary(
            total_flights=total_flights,
            high_risk_flights_count=high_risk_count,
            critical_risk_flights_count=critical_risk_count,
            avg_delay_probability=round(avg_prob, 3),
            total_impacted_passengers=total_impacted_passengers,
            on_time_percentage=on_time_pct,
        )

    @staticmethod
    def get_high_risk_flights(
        db: Session,
        risk_filter: Optional[str] = None
    ) -> List[HighRiskFlightItem]:
        OriginAirport = aliased(Airport)
        DestAirport = aliased(Airport)

        query = (
            db.query(Flight)
            .join(DelayPrediction, Flight.id == DelayPrediction.flight_id)
            .join(OriginAirport, Flight.origin_airport_id == OriginAirport.id)
            .join(DestAirport, Flight.destination_airport_id == DestAirport.id)
        )

        if risk_filter:
            upper_risk = risk_filter.upper()
            query = query.filter(DelayPrediction.risk_level == upper_risk)
        else:
            query = query.filter(
                (DelayPrediction.risk_level.in_(["HIGH", "CRITICAL"])) |
                (DelayPrediction.delay_probability >= 0.40)
            )

        flights = query.all()

        from app.services.flight_service import FlightService
        flight_service = FlightService(db)

        results = []
        for flight in flights:
            # Count confirmed reservations & passengers
            reservations = (
                db.query(Reservation)
                .filter(
                    Reservation.flight_id == flight.id,
                    Reservation.status == "CONFIRMED"
                )
                .all()
            )
            impacted_res_count = len(reservations)
            booked_passengers_count = sum(len(r.passengers) for r in reservations)

            flight_resp = flight_service._to_flight_response(flight)
            results.append(
                HighRiskFlightItem(
                    flight=flight_resp,
                    booked_passengers_count=booked_passengers_count,
                    impacted_reservations_count=impacted_res_count,
                )
            )

        # Sort by highest delay probability first
        results.sort(
            key=lambda x: x.flight.delay_prediction.delay_probability if x.flight.delay_prediction else 0,
            reverse=True
        )
        return results
