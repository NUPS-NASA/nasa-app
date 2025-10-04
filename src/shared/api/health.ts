import { apiClient } from './client';
import type { HealthResponse } from '../types/index';

export const getServiceHealth = () => apiClient.request<HealthResponse>('/');
