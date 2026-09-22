import { apiClient } from './apiClient';
import {
  Flight,
  Airport,
  Airline,
  FlightSearchParams,
  PaginatedFlightResponse
} from '../types/flight';

export const flightService = {
  async searchFlights(params: FlightSearchParams): Promise<PaginatedFlightResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    const response = await apiClient.get<PaginatedFlightResponse>('/flights', {
      params: cleanParams,
    });
    return response.data;
  },

  async getFlightById(id: string): Promise<Flight> {
    const response = await apiClient.get<Flight>(`/flights/${id}`);
    return response.data;
  },

  async getAirports(): Promise<Airport[]> {
    const response = await apiClient.get<Airport[]>('/airports');
    return response.data;
  },

  async getAirlines(): Promise<Airline[]> {
    const response = await apiClient.get<Airline[]>('/airlines');
    return response.data;
  },
};
