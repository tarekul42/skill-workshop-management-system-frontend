import { describe, it, expect } from "vitest";
import { BACKEND_API_URL, FRONTEND_URL, DASHBOARD_ROUTES } from "../constants";

describe("constants", () => {
  it("should have backend API URL", () => {
    expect(BACKEND_API_URL).toBeDefined();
    expect(typeof BACKEND_API_URL).toBe("string");
  });

  it("should have frontend URL", () => {
    expect(FRONTEND_URL).toBeDefined();
    expect(typeof FRONTEND_URL).toBe("string");
  });

  it("should define dashboard routes for all roles", () => {
    expect(DASHBOARD_ROUTES.SUPER_ADMIN).toBe("/super-admin/dashboard");
    expect(DASHBOARD_ROUTES.ADMIN).toBe("/admin/dashboard");
    expect(DASHBOARD_ROUTES.INSTRUCTOR).toBe("/instructor/dashboard");
    expect(DASHBOARD_ROUTES.STUDENT).toBe("/student/dashboard");
  });

  it("should not have undefined dashboard routes", () => {
    Object.values(DASHBOARD_ROUTES).forEach((route) => {
      expect(route).toBeTruthy();
      expect(route).toContain("/dashboard");
    });
  });
});
