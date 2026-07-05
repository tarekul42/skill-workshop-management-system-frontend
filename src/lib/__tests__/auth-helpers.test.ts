import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock sessionStorage (OTP flow still uses it)
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

const user = {
  _id: "1",
  name: "Test User",
  email: "test@test.com",
  role: "STUDENT",
  isVerified: true,
};

const userWithPicture = {
  _id: "1",
  name: "Test User",
  email: "test@test.com",
  role: "INSTRUCTOR",
  picture: "https://example.com/avatar.jpg",
  isVerified: true,
};

import {
  saveUser,
  getSavedUser,
  clearSavedUser,
  isLoggedIn,
  getUserRole,
  redirectToDashboard,
  storeOTPEmail,
  getOTPEmail,
  clearOTPEmail,
  storeOTPName,
  getOTPName,
  clearOTPName,
} from "@/lib/auth-helpers";

describe("auth-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    clearSavedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("saveUser / getSavedUser", () => {
    it("should save and retrieve user", () => {
      saveUser(user);
      const result = getSavedUser();
      expect(result).toEqual(user);
    });

    it("should return null when no user is saved", () => {
      const result = getSavedUser();
      expect(result).toBeNull();
    });

    it("should include picture field when provided", () => {
      saveUser(userWithPicture);
      const result = getSavedUser();
      expect(result?.picture).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("clearSavedUser", () => {
    it("should clear the saved user", () => {
      saveUser(user);
      clearSavedUser();
      expect(getSavedUser()).toBeNull();
    });
  });

  describe("isLoggedIn", () => {
    it("should return true when user exists", () => {
      saveUser(user);
      expect(isLoggedIn()).toBe(true);
    });

    it("should return false when no user exists", () => {
      expect(isLoggedIn()).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("should return the user role when logged in", () => {
      saveUser({ ...user, role: "ADMIN" });
      expect(getUserRole()).toBe("ADMIN");
    });

    it("should return null when not logged in", () => {
      expect(getUserRole()).toBeNull();
    });
  });

  describe("redirectToDashboard", () => {
    it("should return admin dashboard route for ADMIN role", () => {
      expect(redirectToDashboard("ADMIN")).toBe("/admin/dashboard");
    });

    it("should return super-admin dashboard route for SUPER_ADMIN role", () => {
      expect(redirectToDashboard("SUPER_ADMIN")).toBe("/super-admin/dashboard");
    });

    it("should return instructor dashboard route for INSTRUCTOR role", () => {
      expect(redirectToDashboard("INSTRUCTOR")).toBe("/instructor/dashboard");
    });

    it("should return student dashboard route for STUDENT role", () => {
      expect(redirectToDashboard("STUDENT")).toBe("/student/dashboard");
    });

    it("should return /login for unknown roles", () => {
      expect(redirectToDashboard("UNKNOWN")).toBe("/login");
    });
  });

  describe("OTP email storage", () => {
    it("should store and retrieve OTP email", () => {
      storeOTPEmail("test@test.com");
      const result = getOTPEmail();

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "skillworkshop_otp_email",
        "test@test.com"
      );
      expect(result).toBe("test@test.com");
    });

    it("should clear OTP email", () => {
      storeOTPEmail("test@test.com");
      clearOTPEmail();
      const result = getOTPEmail();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_otp_email");
      expect(result).toBeNull();
    });
  });

  describe("OTP name storage", () => {
    it("should store and retrieve OTP name", () => {
      storeOTPName("Test User");
      const result = getOTPName();

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "skillworkshop_otp_name",
        "Test User"
      );
      expect(result).toBe("Test User");
    });

    it("should clear OTP name", () => {
      storeOTPName("Test User");
      clearOTPName();
      const result = getOTPName();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("skillworkshop_otp_name");
      expect(result).toBeNull();
    });
  });
});
