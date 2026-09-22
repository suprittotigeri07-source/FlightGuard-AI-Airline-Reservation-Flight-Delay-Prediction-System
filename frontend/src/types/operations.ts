import { Flight } from './flight';

export interface OperationsSummary {
  total_flights: number;
  high_risk_flights_count: number;
  critical_risk_flights_count: number;
  avg_delay_probability: number;
  total_impacted_passengers: number;
  on_time_percentage: number;
}

export interface HighRiskFlightItem {
  flight: Flight;
  booked_passengers_count: number;
  impacted_reservations_count: number;
}
