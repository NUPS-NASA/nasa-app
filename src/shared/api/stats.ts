import { apiClient } from './client';
import type { ContributionRead, UserStatsRead } from '../types';

export const getUserStats = (userId: number) =>
  apiClient.request<UserStatsRead>(`/users/${userId}/stats`);

export interface GetUserContributionsParams {
  from?: string | null;
  to?: string | null;
  includeSkyPoints?: boolean;
}

export const getUserContributions = (userId: number, params: GetUserContributionsParams = {}) =>
  apiClient.request<ContributionRead>(`/users/${userId}/contributions`, {
    query: {
      from: params.from ?? undefined,
      to: params.to ?? undefined,
      include_sky_points: params.includeSkyPoints,
    },
  });

export const statsApi = {
  getUserStats,
  getUserContributions,
};
