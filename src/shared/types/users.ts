import type { components } from './openapi';

export type UserProfileCreate = components['schemas']['UserProfileCreate'];
export type UserProfileRead = components['schemas']['UserProfileRead'];
export type UserProfileUpdate = components['schemas']['UserProfileUpdate'];

export type UserCreate = components['schemas']['UserCreate'];
export type UserUpdate = components['schemas']['UserUpdate'];
export type UserRead = components['schemas']['UserRead'];
export type UserLogin = components['schemas']['UserLogin'];

export type FollowCreate = components['schemas']['FollowCreate'];
export type FollowRead = components['schemas']['FollowRead'];
export type FollowerCreate = components['schemas']['FollowerCreate'];

export type UserInfo = Pick<UserRead, 'id' | 'email' | 'created_at' | 'updated_at'> &
  Pick<UserProfileRead, 'bio' | 'avatar_url'>;

export type UserProfile = UserInfo;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthLoginResponse extends AuthTokens {
  user: UserRead;
}

export interface AuthTokenRefreshRequest {
  refresh_token: string;
}

export interface AuthTokenRefreshResponse extends AuthTokens {
  user: UserRead;
}
