import { apiClient } from './client';
import type { CandidateVerifyUpdate } from '../types';

export const verifyCandidate = (candidateId: number, payload: CandidateVerifyUpdate) =>
  apiClient.request<null>(`/candidates/${candidateId}`, {
    method: 'PATCH',
    body: payload,
  });

export const candidatesApi = {
  verifyCandidate,
};
