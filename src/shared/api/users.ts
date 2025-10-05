import { apiClient } from './client';
import type {
  AuthLoginResponse,
  AuthTokenRefreshRequest,
  AuthTokenRefreshResponse,
  UserCreate,
  UserLogin,
  UserRead,
  UserUpdate,
  UserProfileRead,
  UserProfileUpdate,
} from '../types/index';

export const listUsers = () => apiClient.request<UserRead[]>('/users');

export const createUser = (payload: UserCreate) =>
  apiClient.request<UserRead>('/users', {
    method: 'POST',
    body: payload,
  });

export const getUser = (userId: number) => apiClient.request<UserRead>(`/users/${userId}`);

export const updateUser = (userId: number, payload: UserUpdate) =>
  apiClient.request<UserRead>(`/users/${userId}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteUser = (userId: number) =>
  apiClient.request<null>(`/users/${userId}`, {
    method: 'DELETE',
  });

export const getUserProfile = (userId: number) =>
  apiClient.request<UserProfileRead>(`/users/${userId}/profile`);

export const upsertUserProfile = (userId: number, payload: UserProfileUpdate) =>
  apiClient.request<UserProfileRead>(`/users/${userId}/profile`, {
    method: 'PUT',
    body: payload,
  });

export const loginUser = (payload: UserLogin) =>
  apiClient.request<AuthLoginResponse>('/users/login', {
    method: 'POST',
    body: payload,
    skipAuthRetry: true,
  });

export const refreshAuthTokens = (payload: AuthTokenRefreshRequest) =>
  apiClient.request<AuthTokenRefreshResponse>('/users/refresh', {
    method: 'POST',
    body: payload,
    skipAuthRetry: true,
  });

export const getCurrentUser = () =>
  apiClient.request<UserRead>('/users/me');

export const usersApi = {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  upsertUserProfile,
  loginUser,
  refreshAuthTokens,
  getCurrentUser,
};
