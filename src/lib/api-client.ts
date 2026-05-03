import { BACKEND_API_URL } from "./constants";

// ─── Auth session expired helper ──────────────────────────────────

export function handleSessionExpired(): void {
  if (typeof window === "undefined") return;
  clearAccessToken();
  localStorage.removeItem("skillworkshop_user");
  document.cookie = "swms_role=;path=/;max-age=0;SameSite=Lax";
  window.location.href = "/login";
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

export function storeAccessToken(token: string): void {
  setAccessToken(token);
}

const SESSION_EXPIRED_MSG = "Session expired. Please log in again.";

async function attemptTokenRefresh(
  fetchHeaders: Record<string, string>,
  url: string,
  fetchOptions: RequestInit,
): Promise<Response> {
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
        fetchHeaders["Authorization"] = `Bearer ${refreshData.data.accessToken}`;
      }
      return await fetch(url, fetchOptions);
    }

    handleSessionExpired();
    throw new Error(SESSION_EXPIRED_MSG);
  } catch (err) {
    if (err instanceof Error && err.message === SESSION_EXPIRED_MSG) throw err;
    handleSessionExpired();
    throw new Error(SESSION_EXPIRED_MSG);
  }
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
  options: ApiClientOptions & { returnMeta: true },
): Promise<PaginatedResult<T>>;
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiClientOptions & { returnMeta?: false },
): Promise<T>;
export async function apiRequest<T>(
  endpoint: string,
  options: ApiClientOptions = {},
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
    try {
      const csrfRes = await fetch(`${BACKEND_API_URL}/csrf-token`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        if (csrfData?.csrfToken) {
          fetchHeaders["x-csrf-token"] = csrfData.csrfToken;
        }
      }
    } catch {
      // Non-critical
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
    response = await fetch(url, fetchOptions);
  } catch (err) {
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
  options: Omit<ApiClientOptions, "returnMeta"> = {},
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: false });
}

export async function apiClientPaginated<T>(
  endpoint: string,
  options: Omit<ApiClientOptions, "returnMeta"> = {},
): Promise<PaginatedResult<T>> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: true });
}

export async function apiClientFormData<T>(
  endpoint: string,
  options: Omit<ApiClientOptions, "returnMeta"> & { body: FormData },
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, returnMeta: false });
}
