import type { components } from './openapi';

export type HealthResponse = Record<string, string | number>;
export type ValidationError = components['schemas']['ValidationError'];
export type HTTPValidationError = components['schemas']['HTTPValidationError'];
