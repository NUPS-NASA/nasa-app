import {
  createContext,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { ApiError } from '../../shared/api';
import { createUser, listUsers } from '../../shared/api/users';
import type { UserRead } from '../../shared/types/users';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface SignupPayload {
  email: string;
  name: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const userFromResponse = (user: UserRead): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.profile?.bio ?? user.email,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return toHex(digest);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(password, 'utf-8').toString('base64');
  }

  return password;
};

const AUTH_STORAGE_KEY = 'nups-auth-user';

const isAuthUser = (candidate: unknown): candidate is AuthUser => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const value = candidate as Partial<AuthUser>;

  return (
    typeof value.id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
};

const readStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storages = [window.sessionStorage, window.localStorage];

  for (const storage of storages) {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      if (isAuthUser(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse stored auth user', error);
    }

    storage.removeItem(AUTH_STORAGE_KEY);
  }

  return null;
};

const persistUser = (authUser: AuthUser, remember: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  const primaryStorage = remember ? window.localStorage : window.sessionStorage;
  const secondaryStorage = remember ? window.sessionStorage : window.localStorage;

  primaryStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  secondaryStorage.removeItem(AUTH_STORAGE_KEY);
};

const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = readStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    setIsReady(true);
  }, []);

  const signup = useCallback(async ({ email, name, password }: SignupPayload) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const hashedPassword = await hashPassword(password);

    try {
      const createdUser = await createUser({
        email: normalizedEmail,
        profile: {
          bio: trimmedName || null,
          avatar_url: hashedPassword,
        },
      });

      const authUser = userFromResponse(createdUser);
      setUser(authUser);
      persistUser(authUser, false);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        throw new Error('이미 등록된 이메일입니다.');
      }

      throw new Error('회원가입에 실패했습니다.');
    }
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);

    const users = await listUsers();
    const matchingUser = users.find(candidate => candidate.email === normalizedEmail);

    if (!matchingUser) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const storedHash = matchingUser.profile?.avatar_url;
    if (!storedHash || storedHash !== hashedPassword) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const authUser = userFromResponse(matchingUser);
    setUser(authUser);
    persistUser(authUser, remember);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      signup,
      login,
      logout,
    }),
    [isReady, login, logout, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
};
