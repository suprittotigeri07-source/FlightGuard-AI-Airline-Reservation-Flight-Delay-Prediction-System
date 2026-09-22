export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface Airline {
  id: string;
  code: string;
  name: string;
  country?: string;
}

export interface Aircraft {
  id: string;
  tail_number: string;
  model: string;
  total_capacity: number;
}

export interface DelayPrediction {
  id: string;
  delay_probability: number;
  predicted_delay_minutes: number;
  risk_level: RiskLevel;
  contributing_factors: string[];
  model_version: string;
  created_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: Airline;
  aircraft: Aircraft;
  origin: Airport;
  destination: Airport;
  scheduled_departure: string;
  scheduled_arrival: string;
  actual_departure?: string;
  actual_arrival?: string;
  duration_minutes: number;
  status: string;
  base_price: number;
  available_seats: number;
  delay_prediction?: DelayPrediction;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departure_date?: string;
  airline_code?: string;
  min_price?: number;
  max_price?: number;
  risk_level?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedFlightResponse {
  items: Flight[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
