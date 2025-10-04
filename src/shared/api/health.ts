import { apiClient } from './client';
import type { HealthResponse } from './schemas';

export const getServiceHealth = () => apiClient.request<HealthResponse>('/');
