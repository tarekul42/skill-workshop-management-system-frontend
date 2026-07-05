import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock window.location.assign
const mockLocationAssign = vi.fn();
Object.defineProperty(global, "window", {
  value: {
    location: { assign: mockLocationAssign, pathname: "/" },
  },
  writable: true,
});

import {
  apiClient,
  apiClientPaginated,
  apiClientFormData,
  storeAccessToken,
  clearAccessToken,
  handleSessionExpired,
} from "@/lib/api-client";

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeAccessToken("test-access-token");
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it("should attach Authorization header when access token exists", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "1" } }),
    });

    await apiClient("/test");

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBe("Bearer test-access-token");
  });

  it("should not attach Authorization header when no access token", async () => {
    clearAccessToken();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await apiClient("/user/register", { method: "POST", body: {} });

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBeUndefined();
  });

  it("should fetch CSRF token before mutating requests", async () => {
    // CSRF fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ csrfToken: "test-csrf" }),
    });
    // Actual POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "123" } }),
    });

    await apiClient("/workshop/create", {
      method: "POST",
      body: { title: "Workshop" },
    });

    // Should have called CSRF endpoint first, then the actual endpoint
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toContain("/csrf-token");
  });

  it("should skip CSRF for exempt paths like login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { accessToken: "token", user: {} },
        }),
    });

    await apiClient("/auth/login", {
      method: "POST",
      body: { email: "test@test.com", password: "pass" },
    });

    // Should only make one fetch call (no CSRF)
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("/auth/login");
  });

  it("should throw ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ success: false, message: "Forbidden" }),
    });

    await expect(apiClient("/admin/users")).rejects.toThrow("Forbidden");
  });

  it("should throw ApiError with correct status code", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ success: false, message: "Server Error" }),
    });

    try {
      await apiClient("/test");
      expect.unreachable("Should have thrown");
    } catch (err) {
      const apiError = err as { status: number; message: string };
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe("Server Error");
    }
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(apiClient("/test")).rejects.toThrow("Network error");
  });

  it("should send FormData body as-is without JSON.stringify", async () => {
    // CSRF token fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ csrfToken: "test-csrf" }),
    });
    // Actual POST response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "1" } }),
    });

    const formData = new FormData();
    formData.append("title", "Test Workshop");

    await apiClientFormData("/workshop/create", {
      method: "POST",
      body: formData,
    });

    // The second fetch call is the actual POST (first is CSRF)
    const fetchCall = mockFetch.mock.calls[1];
    expect(fetchCall[1]?.body).toBe(formData);
    expect(fetchCall[1]?.headers).not.toHaveProperty("Content-Type");
  });

  it("should set Content-Type to application/json for non-FormData bodies", async () => {
    // CSRF token fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ csrfToken: "test-csrf" }),
    });
    // Actual POST response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await apiClient("/test", { method: "POST", body: { key: "value" } });

    // The second fetch call is the actual POST (first is CSRF)
    const fetchCall = mockFetch.mock.calls[1];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.["Content-Type"]).toBe("application/json");
  });
});

describe("apiClientPaginated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeAccessToken("test-access-token");
  });

  it("should return data and meta when returnMeta is true", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [{ id: "1" }],
          meta: { page: 1, limit: 10, total: 1, totalPage: 1 },
        }),
    });

    const result = await apiClientPaginated("/workshop");

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("meta");
    expect(result.data).toEqual([{ id: "1" }]);
    expect(result.meta).toEqual({ page: 1, limit: 10, total: 1, totalPage: 1 });
  });
});

describe("handleSessionExpired", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem("skillworkshop_user", JSON.stringify({ name: "Test" }));
  });

  it("should clear user from localStorage and redirect to login", async () => {
    handleSessionExpired();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_user");
    expect(mockLocationAssign).toHaveBeenCalledWith("/login");
  });
});

describe("storeAccessToken / clearAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store and later attach the token to requests", async () => {
    storeAccessToken("new-token-123");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await apiClient("/test");

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBe("Bearer new-token-123");
  });

  it("should clear the token so subsequent requests have no Authorization", async () => {
    storeAccessToken("existing-token");
    clearAccessToken();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await apiClient("/test");

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toBeUndefined();
  });
});
