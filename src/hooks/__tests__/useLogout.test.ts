import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogout } from "../useLogout";

const mockPush = vi.fn();
const mockApiClient = vi.fn();
const mockClearAccessToken = vi.fn();
const mockClearSavedUser = vi.fn();
const mockClearSecureAuthCookie = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
  clearAccessToken: () => mockClearAccessToken(),
}));

vi.mock("@/lib/auth-helpers", () => ({
  clearSavedUser: () => mockClearSavedUser(),
}));

vi.mock("@/app/actions/auth", () => ({
  clearSecureAuthCookie: () => mockClearSecureAuthCookie(),
}));

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiClient, clears user, token, cookie, and redirects to login", async () => {
    mockApiClient.mockResolvedValue(undefined);
    mockClearSecureAuthCookie.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockApiClient).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      skipCsrf: true,
    });
    expect(mockClearSavedUser).toHaveBeenCalledOnce();
    expect(mockClearAccessToken).toHaveBeenCalledOnce();
    expect(mockClearSecureAuthCookie).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("still performs client-side cleanup even when backend call fails", async () => {
    mockApiClient.mockRejectedValue(new Error("Network error"));
    mockClearSecureAuthCookie.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockClearSavedUser).toHaveBeenCalledOnce();
    expect(mockClearAccessToken).toHaveBeenCalledOnce();
    expect(mockClearSecureAuthCookie).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
