import { apiClient } from './apiClient';
import {
  Reservation,
  ReservationCreatePayload,
  PaginatedReservationResponse
} from '../types/reservation';

export const reservationService = {
  async createReservation(payload: ReservationCreatePayload): Promise<Reservation> {
    const response = await apiClient.post<Reservation>('/reservations', payload);
    return response.data;
  },

  async getMyReservations(page: number = 1, limit: number = 10): Promise<PaginatedReservationResponse> {
    const response = await apiClient.get<PaginatedReservationResponse>('/reservations', {
      params: { page, limit },
    });
    return response.data;
  },

  async getReservationByPnr(pnr: string): Promise<Reservation> {
    const response = await apiClient.get<Reservation>(`/reservations/${pnr}`);
    return response.data;
  },

  async cancelReservation(id: string): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(`/reservations/${id}/cancel`);
    return response.data;
  },
};
