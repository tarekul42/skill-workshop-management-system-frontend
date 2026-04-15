import { BACKEND_API_URL } from "./constants";

// ─── CSRF-exempt paths (backend doesn't require x-csrf-token) ──────

const CSRF_EXEMPT_PATHS = [
  "/user/register",
  "/auth/login",
  "/auth/forgot-password",
  "/otp/send",
  "/otp/verify",
  "/auth/google",
  "/auth/exchange-code",
  "/auth/refresh-token",
];

function isCsrfExempt(endpoint: string): boolean {
  return CSRF_EXEMPT_PATHS.some((p) => endpoint.startsWith(p));
}

// ─── Token storage (in-memory + localStorage fallback) ────────────

const TOKEN_KEY = "skillworkshop_access_token";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
}

/** Call this after login to store the access token */
export function storeAccessToken(token: string): void {
  setAccessToken(token);
}

// ─── Main API client ───────────────────────────────────────────────

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip CSRF token fetch even for non-exempt paths */
  skipCsrf?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPage: number };
}

/**
 * Generic fetch wrapper for the backend API.
 *
 * - Prepends BACKEND_API_URL to every endpoint
 * - Uses Authorization: Bearer <token> header (token stored in sessionStorage)
 * - Uses credentials: "include" for cross-origin cookie support on refresh requests
 * - Fetches CSRF token from /csrf-token for mutating requests (unless exempt)
 * - Parses JSON and throws on !success
 * - On 401, attempts one token refresh then retries once
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, skipCsrf = false } = options;

  const url = `${BACKEND_API_URL}${endpoint}`;

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // ── Attach access token if available ─────────────────────────────
  const token = getAccessToken();
  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  // ── Attach CSRF token for mutating requests ──────────────────────
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutating && !isCsrfExempt(endpoint) && !skipCsrf) {
    try {
      const csrfRes = await fetch(`${BACKEND_API_URL}/csrf-token`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        if (csrfData?.csrfToken) {
          fetchHeaders["x-csrf-token"] = csrfData.csrfToken;
        }
      }
    } catch {
      // Non-critical — CSRF fetch failed silently
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response = await fetch(url, fetchOptions);

  // ── Token refresh on 401 ────────────────────────────────────────
  if (response.status === 401 && !isCsrfExempt(endpoint)) {
    try {
      const refreshRes = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          fetchHeaders["Authorization"] =
            `Bearer ${refreshData.data.accessToken}`;
        }
        response = await fetch(url, fetchOptions);
      }
    } catch {
      // Refresh failed — continue with original 401
    }
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T>;

  if (!response.ok || !json?.success) {
    const message =
      (json as unknown as { message?: string })?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json.data;
}

// ─── Paginated API client ───────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface PaginatedResult<T> {
  data: T;
  meta: PaginationMeta;
}

/**
 * Same as `apiClient` but returns both `data` and `meta` for paginated
 * authenticated GET endpoints.
 */
export async function apiClientPaginated<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<PaginatedResult<T>> {
  const url = `${BACKEND_API_URL}${endpoint}`;

  const fetchHeaders: Record<string, string> = {};

  // ── Attach access token if available ─────────────────────────────
  const token = getAccessToken();
  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(fetchHeaders, options.headers);
  }

  let response = await fetch(url, {
    method: options.method ?? "GET",
    headers: fetchHeaders,
  });

  // ── Token refresh on 401 ────────────────────────────────────────
  if (response.status === 401 && !isCsrfExempt(endpoint)) {
    try {
      const refreshRes = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          fetchHeaders["Authorization"] =
            `Bearer ${refreshData.data.accessToken}`;
        }
        response = await fetch(url, {
          method: options.method ?? "GET",
          headers: fetchHeaders,
        });
      }
    } catch {
      // Refresh failed — continue with original 401
    }
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T> & {
    meta?: PaginationMeta;
  };

  if (!response.ok || !json?.success) {
    const message =
      (json as unknown as { message?: string })?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    data: json.data,
    meta: json.meta!,
  };
}

// ─── Form-data API client ───────────────────────────────────────────

interface FormDataClientOptions {
  method?: "POST" | "PUT" | "PATCH";
  body: FormData;
  headers?: Record<string, string>;
  /** Skip CSRF token fetch even for non-exempt paths */
  skipCsrf?: boolean;
}

/**
 * Like `apiClient` but sends `multipart/form-data` instead of JSON.
 *
 * - Does NOT set `Content-Type` header so the browser can set the
 *   correct `boundary` attribute automatically.
 * - Still handles CSRF and auth tokens identically to `apiClient`.
 * - Still retries once on 401 after a token refresh.
 */
export async function apiClientFormData<T>(
  endpoint: string,
  options: FormDataClientOptions,
): Promise<T> {
  const { method = "POST", body, headers = {}, skipCsrf = false } = options;

  const url = `${BACKEND_API_URL}${endpoint}`;

  const fetchHeaders: Record<string, string> = { ...headers };

  // ── Attach access token if available ─────────────────────────────
  const token = getAccessToken();
  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  // ── Attach CSRF token for mutating requests ──────────────────────
  if (!isCsrfExempt(endpoint) && !skipCsrf) {
    try {
      const csrfRes = await fetch(`${BACKEND_API_URL}/csrf-token`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        if (csrfData?.csrfToken) {
          fetchHeaders["x-csrf-token"] = csrfData.csrfToken;
        }
      }
    } catch {
      // Non-critical — CSRF fetch failed silently
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
    body,
  };

  let response = await fetch(url, fetchOptions);

  // ── Token refresh on 401 ────────────────────────────────────────
  if (response.status === 401 && !isCsrfExempt(endpoint)) {
    try {
      const refreshRes = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          fetchHeaders["Authorization"] =
            `Bearer ${refreshData.data.accessToken}`;
        }
        response = await fetch(url, fetchOptions);
      }
    } catch {
      // Refresh failed — continue with original 401
    }
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T>;

  if (!response.ok || !json?.success) {
    const message =
      (json as unknown as { message?: string })?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json.data;
}
