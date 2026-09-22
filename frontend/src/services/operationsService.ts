import { apiClient } from './apiClient';
import { OperationsSummary, HighRiskFlightItem } from '../types/operations';

export const operationsService = {
  getSummary: async (): Promise<OperationsSummary> => {
    const response = await apiClient.get<OperationsSummary>('/operations/summary');
    return response.data;
  },

  getHighRiskFlights: async (riskLevel?: string): Promise<HighRiskFlightItem[]> => {
    const params: Record<string, string> = {};
    if (riskLevel && riskLevel !== 'ALL') {
      params.risk_level = riskLevel;
    }
    const response = await apiClient.get<HighRiskFlightItem[]>('/operations/high-risk-flights', { params });
    return response.data;
  },
};
