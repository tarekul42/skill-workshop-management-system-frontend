import { describe, it, expect, vi, beforeEach } from "vitest";

// Track mock cookie store
const mockSet = vi.fn();
const mockDelete = vi.fn();

// Mock jose — SignJWT is a class that returns a builder chain
vi.mock("jose", () => {
  const chain = {
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  };
  return {
    SignJWT: class {
      constructor() {
        return chain;
      }
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: mockSet,
    get: vi.fn(),
    delete: mockDelete,
  })),
}));

// Use dynamic import to ensure mocks are applied before module loads
const loadAuth = () => import("../auth");

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key-for-unit-tests";
  });

  describe("setSecureAuthCookie", () => {
    it("should set a JWT-signed httpOnly cookie with correct parameters", async () => {
      const { setSecureAuthCookie } = await loadAuth();
      await setSecureAuthCookie("ADMIN");

      expect(mockSet).toHaveBeenCalledWith(
        "swms_role",
        "mock-jwt-token",
        expect.objectContaining({
          path: "/",
          maxAge: expect.any(Number),
          sameSite: "lax",
          httpOnly: true,
        })
      );
    });

    it("should set cookie with 1 day maxAge", async () => {
      const { setSecureAuthCookie } = await loadAuth();
      await setSecureAuthCookie("STUDENT");

      const setCall = mockSet.mock.calls[0];
      expect(setCall).toBeDefined();
      const options = setCall[2];
      expect(options.maxAge).toBe(1 * 24 * 60 * 60);
    });

    it("should set secure flag in production", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      (process.env as Record<string, string>).NODE_ENV = "production";

      try {
        const { setSecureAuthCookie } = await loadAuth();
        await setSecureAuthCookie("INSTRUCTOR");

        const setCall = mockSet.mock.calls[0];
        expect(setCall).toBeDefined();
        const options = setCall[2];
        expect(options.secure).toBe(true);
      } finally {
        (process.env as Record<string, string>).NODE_ENV = originalNodeEnv;
      }
    });

    it("should not set secure flag in development", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      (process.env as Record<string, string>).NODE_ENV = "development";

      try {
        const { setSecureAuthCookie } = await loadAuth();
        await setSecureAuthCookie("STUDENT");

        const setCall = mockSet.mock.calls[0];
        expect(setCall).toBeDefined();
        const options = setCall[2];
        expect(options.secure).toBe(false);
      } finally {
        (process.env as Record<string, string>).NODE_ENV = originalNodeEnv;
      }
    });

    it("should throw if JWT_SECRET is not set", async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete (process.env as Record<string, string | undefined>).JWT_SECRET;

      try {
        const { setSecureAuthCookie } = await loadAuth();
        await expect(setSecureAuthCookie("ADMIN")).rejects.toThrow("JWT_SECRET");
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it("should accept all valid role values", async () => {
      const { setSecureAuthCookie } = await loadAuth();

      const roles = ["ADMIN", "SUPER_ADMIN", "INSTRUCTOR", "STUDENT"];
      for (const role of roles) {
        vi.clearAllMocks();
        await setSecureAuthCookie(role);
        expect(mockSet).toHaveBeenCalled();
      }
    });
  });

  describe("clearSecureAuthCookie", () => {
    it("should delete the swms_role cookie", async () => {
      const { clearSecureAuthCookie } = await loadAuth();
      await clearSecureAuthCookie();

      expect(mockDelete).toHaveBeenCalledWith("swms_role");
    });
  });
});
