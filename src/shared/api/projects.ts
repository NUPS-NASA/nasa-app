import { apiClient } from './client';
import type {
  PinCreate,
  PinRead,
  PinReorder,
  ProjectCreate,
  ProjectMemberCreate,
  ProjectMemberRead,
  ProjectMemberUpdate,
  ProjectRead,
  ProjectRepositoryLinkCreate,
  ProjectUpdate,
  RepositoryRead,
} from '../types';

export interface ListProjectsParams {
  memberId?: number | null;
  q?: string | null;
}

export const listProjects = (params: ListProjectsParams = {}) =>
  apiClient.request<ProjectRead[]>('/projects', {
    query: {
      member_id: params.memberId ?? undefined,
      q: params.q ?? undefined,
    },
  });

export const createProject = (payload: ProjectCreate) =>
  apiClient.request<ProjectRead>('/projects', {
    method: 'POST',
    body: payload,
  });

export const getProject = (projectId: number) =>
  apiClient.request<ProjectRead>(`/projects/${projectId}`);

export const updateProject = (projectId: number, payload: ProjectUpdate) =>
  apiClient.request<ProjectRead>(`/projects/${projectId}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteProject = (projectId: number) =>
  apiClient.request<null>(`/projects/${projectId}`, {
    method: 'DELETE',
  });

export const listProjectMembers = (projectId: number) =>
  apiClient.request<ProjectMemberRead[]>(`/projects/${projectId}/members`);

export const addProjectMember = (projectId: number, payload: ProjectMemberCreate) =>
  apiClient.request<ProjectMemberRead>(`/projects/${projectId}/members`, {
    method: 'POST',
    body: payload,
  });

export const updateProjectMember = (
  projectId: number,
  userId: number,
  payload: ProjectMemberUpdate,
) =>
  apiClient.request<null>(`/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    body: payload,
  });

export const removeProjectMember = (projectId: number, userId: number) =>
  apiClient.request<null>(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });

export const listProjectRepositories = (projectId: number) =>
  apiClient.request<RepositoryRead[]>(`/projects/${projectId}/repositories`);

export const attachRepositoryToProject = (
  projectId: number,
  payload: ProjectRepositoryLinkCreate,
) =>
  apiClient.request<unknown>(`/projects/${projectId}/repositories`, {
    method: 'POST',
    body: payload,
  });

export const detachRepositoryFromProject = (projectId: number, repositoryId: number) =>
  apiClient.request<null>(`/projects/${projectId}/repositories/${repositoryId}`, {
    method: 'DELETE',
  });

export const listPinnedProjects = (userId: number) =>
  apiClient.request<PinRead[]>(`/users/${userId}/pinned-projects`);

export const pinProject = (userId: number, payload: PinCreate) =>
  apiClient.request<PinRead>(`/users/${userId}/pinned-projects`, {
    method: 'POST',
    body: payload,
  });

export const reorderPinnedProjects = (userId: number, payload: PinReorder) =>
  apiClient.request<null>(`/users/${userId}/pinned-projects`, {
    method: 'PATCH',
    body: payload,
  });

export const unpinProject = (userId: number, projectId: number) =>
  apiClient.request<null>(`/users/${userId}/pinned-projects/${projectId}`, {
    method: 'DELETE',
  });

export const projectsApi = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  listProjectRepositories,
  attachRepositoryToProject,
  detachRepositoryFromProject,
  listPinnedProjects,
  pinProject,
  reorderPinnedProjects,
  unpinProject,
};
