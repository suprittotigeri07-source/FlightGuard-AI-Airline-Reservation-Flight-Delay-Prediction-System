export interface UserAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

export interface FlightCreatePayload {
  flight_number: string;
  airline_id: string;
  aircraft_id: string;
  origin_airport_id: string;
  destination_airport_id: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  base_price: number;
  available_seats?: number;
}

export interface AirportCreatePayload {
  code: string;
  name: string;
  city: string;
  country?: string;
  timezone?: string;
}

export interface AirlineCreatePayload {
  code: string;
  name: string;
  country?: string;
}

export interface AircraftCreatePayload {
  tail_number: string;
  model: string;
  total_capacity: number;
  airline_id: string;
}

export interface AuditLog {
  id: string;
  user_email?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details_json?: string;
  ip_address?: string;
  created_at: string;
}
