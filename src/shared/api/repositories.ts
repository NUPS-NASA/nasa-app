import { apiClient } from './client';
import type {
  RepositoryCreate,
  RepositoryRead,
  RepositoryUpdate,
  StarRead,
} from '../types';

export interface ListRepositoriesParams {
  ownerId?: number | null;
  q?: string | null;
  starredBy?: number | null;
  includeSession?: boolean;
}

export const listRepositories = (params: ListRepositoriesParams = {}) =>
  apiClient.request<RepositoryRead[]>('/repositories', {
    query: {
      owner_id: params.ownerId ?? undefined,
      q: params.q ?? undefined,
      starred_by: params.starredBy ?? undefined,
      include_session: params.includeSession,
    },
  });

export const createRepository = (payload: RepositoryCreate) =>
  apiClient.request<RepositoryRead>('/repositories', {
    method: 'POST',
    body: payload,
  });

export const getRepository = (repositoryId: number) =>
  apiClient.request<RepositoryRead>(`/repositories/${repositoryId}`);

export const updateRepository = (repositoryId: number, payload: RepositoryUpdate) =>
  apiClient.request<RepositoryRead>(`/repositories/${repositoryId}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteRepository = (repositoryId: number) =>
  apiClient.request<null>(`/repositories/${repositoryId}`, {
    method: 'DELETE',
  });

export const listUserRepositories = (userId: number, includeSession = true) =>
  apiClient.request<RepositoryRead[]>(`/users/${userId}/repositories`, {
    query: { include_session: includeSession },
  });

export const starRepository = (repositoryId: number, userId: number) =>
  apiClient.request<null>(`/repositories/${repositoryId}/star`, {
    method: 'PUT',
    query: { user_id: userId },
  });

export const unstarRepository = (repositoryId: number, userId: number) =>
  apiClient.request<null>(`/repositories/${repositoryId}/star`, {
    method: 'DELETE',
    query: { user_id: userId },
  });

export const listUserStars = (userId: number) =>
  apiClient.request<StarRead[]>(`/users/${userId}/stars`);

export const repositoriesApi = {
  listRepositories,
  createRepository,
  getRepository,
  updateRepository,
  deleteRepository,
  listUserRepositories,
  starRepository,
  unstarRepository,
  listUserStars,
};
