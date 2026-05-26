import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

// Mock sessionStorage
const sessionStorageMock = (() => {
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
Object.defineProperty(global, "sessionStorage", { value: sessionStorageMock });

describe("auth-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("saveUser / getSavedUser", () => {
    it("should save user to localStorage", async () => {
      const user = {
        _id: "1",
        name: "Test User",
        email: "test@test.com",
        role: "STUDENT",
        isVerified: true,
      };

      const { saveUser, getSavedUser } = await import("@/lib/auth-helpers");
      saveUser(user);
      const result = getSavedUser();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "skillworkshop_user",
        JSON.stringify(user)
      );
      expect(result).toEqual(user);
    });

    it("should return null when no user is saved", async () => {
      const { getSavedUser } = await import("@/lib/auth-helpers");
      const result = getSavedUser();

      expect(result).toBeNull();
    });

    it("should return null for malformed JSON in localStorage", async () => {
      localStorageMock.setItem("skillworkshop_user", "not-valid-json");

      const { getSavedUser } = await import("@/lib/auth-helpers");
      const result = getSavedUser();

      expect(result).toBeNull();
    });

    it("should include picture field when provided", async () => {
      const user = {
        _id: "1",
        name: "Test User",
        email: "test@test.com",
        role: "INSTRUCTOR",
        picture: "https://example.com/avatar.jpg",
        isVerified: true,
      };

      const { saveUser, getSavedUser } = await import("@/lib/auth-helpers");
      saveUser(user);
      const result = getSavedUser();

      expect(result?.picture).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("clearSavedUser", () => {
    it("should remove user from localStorage", async () => {
      localStorageMock.setItem("skillworkshop_user", JSON.stringify({ name: "Test" }));

      const { clearSavedUser } = await import("@/lib/auth-helpers");
      clearSavedUser();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_user");
    });
  });

  describe("isLoggedIn", () => {
    it("should return true when user exists in localStorage", async () => {
      const user = {
        _id: "1",
        name: "Test",
        email: "test@test.com",
        role: "STUDENT",
        isVerified: true,
      };
      localStorageMock.setItem("skillworkshop_user", JSON.stringify(user));

      const { isLoggedIn } = await import("@/lib/auth-helpers");
      expect(isLoggedIn()).toBe(true);
    });

    it("should return false when no user exists", async () => {
      const { isLoggedIn } = await import("@/lib/auth-helpers");
      expect(isLoggedIn()).toBe(false);
    });

    it("should return false for malformed user data", async () => {
      localStorageMock.setItem("skillworkshop_user", "corrupted");

      const { isLoggedIn } = await import("@/lib/auth-helpers");
      expect(isLoggedIn()).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("should return the user role when logged in", async () => {
      const user = {
        _id: "1",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
        isVerified: true,
      };
      localStorageMock.setItem("skillworkshop_user", JSON.stringify(user));

      const { getUserRole } = await import("@/lib/auth-helpers");
      expect(getUserRole()).toBe("ADMIN");
    });

    it("should return null when not logged in", async () => {
      const { getUserRole } = await import("@/lib/auth-helpers");
      expect(getUserRole()).toBeNull();
    });
  });

  describe("redirectToDashboard", () => {
    it("should return admin dashboard route for ADMIN role", async () => {
      const { redirectToDashboard } = await import("@/lib/auth-helpers");
      expect(redirectToDashboard("ADMIN")).toBe("/admin/dashboard");
    });

    it("should return super-admin dashboard route for SUPER_ADMIN role", async () => {
      const { redirectToDashboard } = await import("@/lib/auth-helpers");
      expect(redirectToDashboard("SUPER_ADMIN")).toBe("/super-admin/dashboard");
    });

    it("should return instructor dashboard route for INSTRUCTOR role", async () => {
      const { redirectToDashboard } = await import("@/lib/auth-helpers");
      expect(redirectToDashboard("INSTRUCTOR")).toBe("/instructor/dashboard");
    });

    it("should return student dashboard route for STUDENT role", async () => {
      const { redirectToDashboard } = await import("@/lib/auth-helpers");
      expect(redirectToDashboard("STUDENT")).toBe("/student/dashboard");
    });

    it("should return /login for unknown roles", async () => {
      const { redirectToDashboard } = await import("@/lib/auth-helpers");
      expect(redirectToDashboard("UNKNOWN")).toBe("/login");
    });
  });

  describe("OTP email storage", () => {
    it("should store and retrieve OTP email", async () => {
      const { storeOTPEmail, getOTPEmail } = await import("@/lib/auth-helpers");

      storeOTPEmail("test@test.com");
      const result = getOTPEmail();

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "skillworkshop_otp_email",
        "test@test.com"
      );
      expect(result).toBe("test@test.com");
    });

    it("should clear OTP email", async () => {
      sessionStorageMock.setItem("skillworkshop_otp_email", "test@test.com");

      const { clearOTPEmail, getOTPEmail } = await import("@/lib/auth-helpers");
      clearOTPEmail();
      const result = getOTPEmail();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_otp_email");
      expect(result).toBeNull();
    });

    it("setOTPEmail should be an alias for storeOTPEmail", async () => {
      const { setOTPEmail, getOTPEmail } = await import("@/lib/auth-helpers");

      setOTPEmail("alias@test.com");
      const result = getOTPEmail();

      expect(result).toBe("alias@test.com");
    });
  });

  describe("OTP name storage", () => {
    it("should store and retrieve OTP name", async () => {
      const { storeOTPName, getOTPName } = await import("@/lib/auth-helpers");

      storeOTPName("Test User");
      const result = getOTPName();

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "skillworkshop_otp_name",
        "Test User"
      );
      expect(result).toBe("Test User");
    });

    it("should clear OTP name", async () => {
      sessionStorageMock.setItem("skillworkshop_otp_name", "Test User");

      const { clearOTPName, getOTPName } = await import("@/lib/auth-helpers");
      clearOTPName();
      const result = getOTPName();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_otp_name");
      expect(result).toBeNull();
    });

    it("setOTPName should be an alias for storeOTPName", async () => {
      const { setOTPName, getOTPName } = await import("@/lib/auth-helpers");

      setOTPName("Alias User");
      const result = getOTPName();

      expect(result).toBe("Alias User");
    });
  });
});
