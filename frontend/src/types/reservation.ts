import { Flight } from './flight';

export interface Passenger {
  id: string;
  first_name: string;
  last_name: string;
  gender?: string;
  seat_number?: string;
}

export interface PassengerCreatePayload {
  first_name: string;
  last_name: string;
  gender?: string;
  seat_preference?: string;
}

export interface Reservation {
  id: string;
  pnr: string;
  user_id: string;
  flight: Flight;
  total_amount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  passengers: Passenger[];
  created_at: string;
  updated_at: string;
}

export interface ReservationCreatePayload {
  flight_id: string;
  passengers: PassengerCreatePayload[];
}

export interface PaginatedReservationResponse {
  items: Reservation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
