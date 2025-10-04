import { apiClient } from './client';
import type {
  CandidateRead,
  PipelineStepRead,
  SessionRead,
} from '../types';

export const listRepositorySessions = (repositoryId: number) =>
  apiClient.request<SessionRead[]>(`/repositories/${repositoryId}/sessions`);

export const getLatestRepositorySession = (repositoryId: number) =>
  apiClient.request<SessionRead>(`/repositories/${repositoryId}/sessions/latest`);

export const getSession = (sessionId: number) =>
  apiClient.request<SessionRead>(`/sessions/${sessionId}`);

export const listPipelineSteps = (sessionId: number) =>
  apiClient.request<PipelineStepRead[]>(`/sessions/${sessionId}/pipeline-steps`);

export const listSessionCandidates = (sessionId: number) =>
  apiClient.request<CandidateRead[]>(`/sessions/${sessionId}/candidates`);

export const sessionsApi = {
  listRepositorySessions,
  getLatestRepositorySession,
  getSession,
  listPipelineSteps,
  listSessionCandidates,
};
