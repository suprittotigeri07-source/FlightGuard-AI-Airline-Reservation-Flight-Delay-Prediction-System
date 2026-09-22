import { apiClient } from './apiClient';
import {
  UserAdmin,
  FlightCreatePayload,
  AirportCreatePayload,
  AirlineCreatePayload,
  AircraftCreatePayload,
  AuditLog
} from '../types/admin';
import { Flight, Airport, Airline, Aircraft } from '../types/flight';

export const adminService = {
  getUsers: async (search?: string): Promise<UserAdmin[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const response = await apiClient.get<UserAdmin[]>('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId: string, roleName: string): Promise<UserAdmin> => {
    const response = await apiClient.patch<UserAdmin>(`/admin/users/${userId}/role`, {
      role_name: roleName,
    });
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<UserAdmin> => {
    const response = await apiClient.patch<UserAdmin>(`/admin/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },

  createFlight: async (payload: FlightCreatePayload): Promise<Flight> => {
    const response = await apiClient.post<Flight>('/admin/flights', payload);
    return response.data;
  },

  createAirport: async (payload: AirportCreatePayload): Promise<Airport> => {
    const response = await apiClient.post<Airport>('/admin/airports', payload);
    return response.data;
  },

  createAirline: async (payload: AirlineCreatePayload): Promise<Airline> => {
    const response = await apiClient.post<Airline>('/admin/airlines', payload);
    return response.data;
  },

  createAircraft: async (payload: AircraftCreatePayload): Promise<Aircraft> => {
    const response = await apiClient.post<Aircraft>('/admin/aircraft', payload);
    return response.data;
  },

  getAuditLogs: async (limit: number = 50): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/admin/audit-logs', {
      params: { limit },
    });
    return response.data;
  },
};
