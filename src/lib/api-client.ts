import { BACKEND_API_URL } from "./constants";
import { clearSavedUser } from "@/lib/auth-helpers";

// ─── Defaults ──────────────────────────────────────────────────────

export const DEFAULT_REQUEST_TIMEOUT = 30_000; // 30 seconds

// ─── In-memory access token ───────────────────────────────────────
// Stored in a module-level variable rather than sessionStorage so that
// an XSS attack cannot enumerate tokens via storage APIs. On page reload
// the token is lost, which triggers a refresh via the httpOnly cookie.

let accessToken: string | null = null;

function getAccessToken(): string | null {
  return accessToken;
}

function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function storeAccessToken(token: string): void {
  accessToken = token;
}

// ─── Auth session expired helper ──────────────────────────────────

export function handleSessionExpired(): void {
  if (typeof window === "undefined") return;
  clearAccessToken();
  clearSavedUser();
  document.cookie = "swms_role=;path=/;max-age=0;SameSite=Lax";

  // Avoid redirect loops: don't redirect if already on an auth page
  const currentPath = window.location.pathname;
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];
  const isOnAuthPage = authPages.some((p) => currentPath === p || currentPath.startsWith(`${p}/`));
  if (isOnAuthPage) return;

  window.location.assign("/login");
}

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

const SESSION_EXPIRED_MSG = "Session expired. Please log in again.";

const TIMEOUT_ERROR_MSG = "Request timed out. Please check your connection and try again.";

function createTimeoutSignal(timeout: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const timeout = options.timeout ?? DEFAULT_REQUEST_TIMEOUT;
  const { signal, clear } = createTimeoutSignal(timeout);
  try {
    return await fetch(url, { ...options, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, TIMEOUT_ERROR_MSG);
    }
    throw err;
  } finally {
    clear();
  }
}

// Refresh mutex to prevent concurrent token refresh calls
let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

async function attemptTokenRefresh(
  fetchHeaders: Record<string, string>,
  url: string,
  fetchOptions: RequestInit
): Promise<Response> {
  // Mutex: if a refresh is already in progress, reuse that promise
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
    // After the in-flight refresh completes, update the token in headers
    const currentToken = getAccessToken();
    if (currentToken) {
      fetchHeaders["Authorization"] = `Bearer ${currentToken}`;
    }
    return fetchWithTimeout(url, fetchOptions);
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshRes = await fetchWithTimeout(`${BACKEND_API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData?.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
        }
        return refreshRes;
      }

      handleSessionExpired();
      throw new Error(SESSION_EXPIRED_MSG);
    } catch (err) {
      if (err instanceof Error && err.message === SESSION_EXPIRED_MSG) throw err;
      handleSessionExpired();
      throw new Error(SESSION_EXPIRED_MSG);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  await refreshPromise;
  // Update headers with the refreshed token before retrying
  const currentToken = getAccessToken();
  if (currentToken) {
    fetchHeaders["Authorization"] = `Bearer ${currentToken}`;
  }
  return fetchWithTimeout(url, fetchOptions);
}

// ─── Unified API client ───────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface PaginatedResult<T> {
  data: T;
  meta: PaginationMeta;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  skipCsrf?: boolean;
  returnMeta?: boolean;
  timeout?: number; // ms, defaults to DEFAULT_REQUEST_TIMEOUT
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiClientOptions & { returnMeta: true }
): Promise<PaginatedResult<T>>;
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiClientOptions & { returnMeta?: false }
): Promise<T>;
export async function apiRequest<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T | PaginatedResult<T>> {
  const { method = "GET", body, headers = {}, skipCsrf = false, returnMeta = false } = options;

  const url = `${BACKEND_API_URL}${endpoint}`;
  const isFormData = body instanceof FormData;

  const fetchHeaders: Record<string, string> = { ...headers };

  if (!isFormData && !fetchHeaders["Content-Type"]) {
    fetchHeaders["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutating && !isCsrfExempt(endpoint) && !skipCsrf) {
    const csrfRes = await fetchWithTimeout(`${BACKEND_API_URL}/csrf-token`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    if (!csrfRes.ok) {
      throw new ApiError(
        csrfRes.status,
        "Failed to fetch CSRF token — cannot process mutating request"
      );
    }
    const csrfData = await csrfRes.json();
    if (csrfData?.csrfToken) {
      fetchHeaders["x-csrf-token"] = csrfData.csrfToken;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
    credentials: "include",
  };

  if (body !== undefined) {
    fetchOptions.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(url, fetchOptions);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("Network error during API request:", err);
    throw new ApiError(0, "Network error. Please check your internet connection.");
  }

  if (response.status === 401 && !isCsrfExempt(endpoint)) {
    response = await attemptTokenRefresh(fetchHeaders, url, fetchOptions);
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T>;

  if (!response.ok || !json?.success) {
    const status = response.status;
    const message = json?.message ?? `Request failed with status ${status}`;

    // Log critical errors
    if (status >= 500) {
      console.error(`[API Server Error] ${method} ${endpoint}:`, json || status);
    }

    throw new ApiError(status, message, json?.data);
  }

  if (returnMeta) {
    return {
      data: json.data,
      meta: json.meta ?? { page: 1, limit: 10, total: 0, totalPage: 1 },
    };
  }

  return json.data;
}

// ─── Legacy Wrapper Aliases ───────────────────────────────────────────

export async function apiClient<T>(
  endpoint: string,
  options: Omit<ApiClientOptions, "returnMeta"> = {}
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: false });
}

export async function apiClientPaginated<T>(
  endpoint: string,
  options: Omit<ApiClientOptions, "returnMeta"> = {}
): Promise<PaginatedResult<T>> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: true });
}

export async function apiClientFormData<T>(
  endpoint: string,
  options: Omit<ApiClientOptions, "returnMeta"> & { body: FormData }
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: false });
}
