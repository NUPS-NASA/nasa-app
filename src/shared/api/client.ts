export interface ApiClientConfig {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
}

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
    const { body, query, headers = {}, ...rest } = options;
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

    const headerBag: Record<string, string> = { ...headers };
    if (!(body instanceof FormData) && body !== undefined && !headerBag['Content-Type']) {
      headerBag['Content-Type'] = 'application/json';
    }

    const init: RequestInit = {
      ...rest,
      headers: headerBag,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    };

    const response = await this.fetchImpl(url, init);

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
