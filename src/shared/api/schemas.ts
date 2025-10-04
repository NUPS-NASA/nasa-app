export type ISODateString = string;

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface UserProfileCreate {
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserProfileRead extends UserProfileCreate {
  user_id: number;
}

export interface UserProfileUpdate {
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserCreate {
  email: string;
  password_hash: string;
  profile?: UserProfileCreate | null;
}

export interface UserUpdate {
  email?: string | null;
  password_hash?: string | null;
  profile?: UserProfileUpdate | null;
}

export interface UserRead {
  email: string;
  id: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  profile?: UserProfileRead | null;
}

export type HealthResponse = Record<string, string | number>;
