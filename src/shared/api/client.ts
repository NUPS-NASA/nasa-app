export interface ApiClientConfig {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  skipAuthRetry?: boolean;
}

interface AuthHandlers {
  getAccessToken: () => string | null;
  refreshTokens: () => Promise<boolean>;
}

let authHandlers: AuthHandlers | null = null;

export const configureApiAuth = (handlers: AuthHandlers | null) => {
  authHandlers = handlers;
};

export class ApiError<T = unknown> extends Error {
  status: number;
  body: T | null;

  constructor(status: number, message: string, body: T | null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const defaultConfig: Required<ApiClientConfig> = {
  baseUrl:
    (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && (process as any)?.env?.VITE_API_BASE_URL) ||
    '/api',
  fetchImpl: globalThis.fetch.bind(globalThis),
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiClientConfig = {}) {
    const merged = { ...defaultConfig, ...config };
    this.baseUrl = merged.baseUrl.replace(/\/$/, '');
    this.fetchImpl = merged.fetchImpl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers = {}, skipAuthRetry = false, ...rest } = options;
    let url = this.baseUrl + (path.startsWith('/') ? path : `/${path}`);

    if (query) {
      const usp = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return;
        }
        usp.append(key, String(value));
      });

      const queryString = usp.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const baseHeaders: Record<string, string> = { ...headers };
    if (!(body instanceof FormData) && body !== undefined && !baseHeaders['Content-Type']) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    const resolvedBody =
      body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined;

    const performFetch = async () => {
      const headersWithAuth: Record<string, string> = { ...baseHeaders };

      if (authHandlers?.getAccessToken) {
        const token = authHandlers.getAccessToken();
        if (token) {
          headersWithAuth['Authorization'] = `Bearer ${token}`;
        } else {
          delete headersWithAuth['Authorization'];
        }
      }

      const init: RequestInit = {
        ...rest,
        headers: headersWithAuth,
        body: resolvedBody,
      };

      return this.fetchImpl(url, init);
    };

    let response = await performFetch();

    if (!skipAuthRetry && response.status === 401 && authHandlers?.refreshTokens) {
      try {
        const refreshed = await authHandlers.refreshTokens();
        if (refreshed) {
          response = await performFetch();
        }
      } catch (error) {
        // Refresh attempts bubble up to the caller.
        throw error;
      }
    }

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.clone().json();
      } catch (err) {
        try {
          errorBody = await response.clone().text();
        } catch (err2) {
          errorBody = null;
        }
      }

      throw new ApiError(response.status, response.statusText || 'Request failed', errorBody);
    }

    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }
}

export const apiClient = new ApiClient();
