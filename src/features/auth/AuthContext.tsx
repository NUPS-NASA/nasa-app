import {
  createContext,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { ApiError, configureApiAuth } from '../../shared/api';
import { createUser, getCurrentUser, loginUser, refreshAuthTokens } from '../../shared/api/users';
import type {
  AuthLoginResponse,
  AuthTokenRefreshResponse,
  UserRead,
} from '../../shared/types/users';

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

interface AuthTokensState {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: AuthUser;
  tokens: AuthTokensState;
  remember: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nups-auth-state';

const userFromResponse = (user: UserRead): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.profile?.bio ?? user.email,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

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

const isAuthTokensState = (candidate: unknown): candidate is AuthTokensState => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const value = candidate as Partial<AuthTokensState>;
  return typeof value.accessToken === 'string' && typeof value.refreshToken === 'string';
};

const isStoredAuthState = (candidate: unknown): candidate is AuthState => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  const value = candidate as Partial<AuthState>;
  return (
    typeof value.remember === 'boolean' &&
    isAuthUser(value.user) &&
    isAuthTokensState(value.tokens)
  );
};

const readStoredAuthState = (): AuthState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storages = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      if (isStoredAuthState(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse stored auth state', error);
    }

    storage.removeItem(AUTH_STORAGE_KEY);
  }

  return null;
};

const persistAuthState = (state: AuthState) => {
  if (typeof window === 'undefined') {
    return;
  }

  const primary = state.remember ? window.localStorage : window.sessionStorage;
  const secondary = state.remember ? window.sessionStorage : window.localStorage;

  primary.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  secondary.removeItem(AUTH_STORAGE_KEY);
};

const clearStoredAuthState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

const buildAuthState = (
  response: AuthLoginResponse | AuthTokenRefreshResponse,
  remember: boolean,
): AuthState => ({
  user: userFromResponse(response.user),
  tokens: {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  },
  remember,
});

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const authStateRef = useRef<AuthState | null>(null);
  const isRefreshingRef = useRef(false);
  const shouldHydrateUserRef = useRef(false);

  const applyAuthState = useCallback((nextState: AuthState | null) => {
    authStateRef.current = nextState;
    setAuthState(nextState);

    if (nextState) {
      persistAuthState(nextState);
      return;
    }

    clearStoredAuthState();
  }, []);

  const refreshTokensHandler = useCallback(async (): Promise<boolean> => {
    const current = authStateRef.current;
    if (!current || !current.tokens.refreshToken) {
      return false;
    }

    if (isRefreshingRef.current) {
      return false;
    }

    isRefreshingRef.current = true;
    try {
      const response = await refreshAuthTokens({
        refresh_token: current.tokens.refreshToken,
      });
      applyAuthState(buildAuthState(response, current.remember));
      return true;
    } catch (error) {
      applyAuthState(null);
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [applyAuthState]);

  useEffect(() => {
    configureApiAuth(
      authState
        ? {
            getAccessToken: () => authStateRef.current?.tokens.accessToken ?? null,
            refreshTokens: refreshTokensHandler,
          }
        : null,
    );
  }, [authState, refreshTokensHandler]);

  useEffect(() => {
    const storedState = readStoredAuthState();
    if (storedState) {
      shouldHydrateUserRef.current = true;
      applyAuthState(storedState);
    }
    setIsReady(true);
  }, [applyAuthState]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const normalizedEmail = email.trim().toLowerCase();

      try {
        const response = await loginUser({
          email: normalizedEmail,
          password,
        });
        shouldHydrateUserRef.current = false;
        applyAuthState(buildAuthState(response, remember));
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        throw new Error('로그인에 실패했습니다.');
      }
    },
    [applyAuthState],
  );

  const signup = useCallback(
    async ({ email, name, password }: SignupPayload) => {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      try {
        await createUser({
          email: normalizedEmail,
          password,
          profile: {
            bio: trimmedName || null,
            avatar_url: null,
          },
        });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 409) {
          throw new Error('이미 등록된 이메일입니다.');
        }

        throw new Error('회원가입에 실패했습니다.');
      }

      await login(normalizedEmail, password, false);
    },
    [login],
  );

  const logout = useCallback(() => {
    shouldHydrateUserRef.current = false;
    applyAuthState(null);
  }, [applyAuthState]);

  useEffect(() => {
    if (!authState || !shouldHydrateUserRef.current) {
      return;
    }

    let isMounted = true;
    shouldHydrateUserRef.current = false;

    (async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted && authStateRef.current) {
          applyAuthState({
            ...authStateRef.current,
            user: userFromResponse(user),
          });
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await refreshTokensHandler();
          return;
        }

        console.error('Failed to refresh authenticated user', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [applyAuthState, authState, refreshTokensHandler]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authState?.user ?? null,
      isReady,
      signup,
      login,
      logout,
    }),
    [authState, isReady, login, logout, signup],
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
