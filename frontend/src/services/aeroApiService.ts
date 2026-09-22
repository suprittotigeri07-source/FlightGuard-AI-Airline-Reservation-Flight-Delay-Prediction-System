import { apiClient } from './apiClient';
import { Flight } from '../types/flight';

export interface LiveSyncResult {
  success: boolean;
  source: string;
  message: string;
  total_synced: number;
  created_count: number;
  updated_count: number;
  flights: Flight[];
}

export interface AeroAPIStatus {
  is_configured: boolean;
  masked_key: string | null;
  base_url: string;
  status: 'CONNECTED' | 'UNCONFIGURED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'UNREACHABLE' | 'ERROR';
  message: string;
  total_flights_in_db: number;
}

export interface LiveTelemetryResponse {
  success: boolean;
  source?: string;
  data: {
    ident: string;
    ident_iata?: string;
    operator_iata?: string;
    origin?: { code_iata?: string; name?: string };
    destination?: { code_iata?: string; name?: string };
    status: string;
    progress_percent?: number;
    altitude_feet?: number;
    groundspeed_knots?: number;
    scheduled_out?: string;
    actual_out?: string;
    scheduled_in?: string;
    estimated_in?: string;
    departure_delay?: number;
    arrival_delay?: number;
  };
}

export const aeroApiService = {
  /**
   * Triggers live flight schedule and telemetry ingestion from FlightAware AeroAPI.
   */
  syncLiveFlights: async (origin?: string, limit: number = 10): Promise<LiveSyncResult> => {
    const params: Record<string, string | number> = { limit };
    if (origin) params.origin = origin;
    const response = await apiClient.post<LiveSyncResult>('/flights/sync-live', null, { params });
    return response.data;
  },

  /**
   * Fetches real-time live radar and tracking data for a specific flight ident.
   */
  getLiveTelemetry: async (ident: string): Promise<LiveTelemetryResponse> => {
    const response = await apiClient.get<LiveTelemetryResponse>(`/flights/live/${ident}`);
    return response.data;
  },

  /**
   * Retrieves the current configuration and connection health of AeroAPI.
   */
  getStatus: async (): Promise<AeroAPIStatus> => {
    const response = await apiClient.get<AeroAPIStatus>('/admin/aeroapi/status');
    return response.data;
  },

  /**
   * Updates the AeroAPI key and verifies connection immediately.
   */
  configureKey: async (apiKey: string): Promise<AeroAPIStatus> => {
    const response = await apiClient.post<AeroAPIStatus>('/admin/aeroapi/config', { api_key: apiKey });
    return response.data;
  },

  /**
   * Triggers live ingestion from the admin portal.
   */
  triggerAdminSync: async (origin?: string, limit: number = 10): Promise<LiveSyncResult> => {
    const params: Record<string, string | number> = { limit };
    if (origin) params.origin = origin;
    const response = await apiClient.post<LiveSyncResult>('/admin/aeroapi/sync', null, { params });
    return response.data;
  },
};
