import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the api-client module
const mockApiClient = vi.fn();
const mockApiClientPaginated = vi.fn();
const mockApiClientFormData = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: mockApiClient,
  apiClientPaginated: mockApiClientPaginated,
  apiClientFormData: mockApiClientFormData,
}));

describe("API Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call apiClient with POST /auth/login and credentials", async () => {
      mockApiClient.mockResolvedValueOnce({
        accessToken: "token",
        refreshToken: "refresh",
        user: { _id: "1", name: "Test", email: "test@test.com", role: "STUDENT", isVerified: true },
      });

      const { login } = await import("../services");
      const result = await login("test@test.com", "password123");

      expect(mockApiClient).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: { email: "test@test.com", password: "password123" },
      });
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
    });
  });

  describe("refreshToken", () => {
    it("should call apiClient with POST /auth/refresh-token", async () => {
      mockApiClient.mockResolvedValueOnce({ accessToken: "new-token" });

      const { refreshToken } = await import("../services");
      const result = await refreshToken();

      expect(mockApiClient).toHaveBeenCalledWith("/auth/refresh-token", {
        method: "POST",
      });
      expect(result).toHaveProperty("accessToken", "new-token");
    });
  });

  describe("logout", () => {
    it("should call apiClient with POST /auth/logout", async () => {
      mockApiClient.mockResolvedValueOnce(undefined);

      const { logout } = await import("../services");
      await logout();

      expect(mockApiClient).toHaveBeenCalledWith("/auth/logout", {
        method: "POST",
      });
    });
  });

  describe("changePassword", () => {
    it("should call apiClient with POST /auth/change-password", async () => {
      mockApiClient.mockResolvedValueOnce(undefined);

      const { changePassword } = await import("../services");
      await changePassword("oldPass", "newPass");

      expect(mockApiClient).toHaveBeenCalledWith(
        "/auth/change-password",
        expect.objectContaining({
          method: "POST",
          body: { oldPassword: "oldPass", newPassword: "newPass" },
        })
      );
    });
  });

  describe("fetchWorkshops", () => {
    it("should call apiClientPaginated with /workshop endpoint", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { fetchWorkshops } = await import("../services");
      const result = await fetchWorkshops();

      expect(mockApiClientPaginated).toHaveBeenCalledWith("/workshop");
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
    });

    it("should append search params when provided", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { fetchWorkshops } = await import("../services");
      await fetchWorkshops({ page: 2, searchTerm: "react", category: "web", level: "beginner" });

      const callUrl = mockApiClientPaginated.mock.calls[0][0];
      expect(callUrl).toContain("page=2");
      expect(callUrl).toContain("searchTerm=react");
      expect(callUrl).toContain("category=web");
      expect(callUrl).toContain("level=beginner");
    });

    it("should not include empty params in the URL", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { fetchWorkshops } = await import("../services");
      await fetchWorkshops({ page: 1 });

      const callUrl = mockApiClientPaginated.mock.calls[0][0];
      expect(callUrl).toBe("/workshop?page=1");
      expect(callUrl).not.toContain("searchTerm");
      expect(callUrl).not.toContain("category");
    });
  });

  describe("fetchWorkshopBySlug", () => {
    it("should fetch a single workshop by slug", async () => {
      const mockWorkshop = { _id: "1", title: "React 101", slug: "react-101" };
      mockApiClient.mockResolvedValueOnce({ data: mockWorkshop });

      const { fetchWorkshopBySlug } = await import("../services");
      const result = await fetchWorkshopBySlug("react-101");

      expect(mockApiClient).toHaveBeenCalledWith("/workshop/react-101");
      expect(result).toEqual(mockWorkshop);
    });

    it("should handle direct workshop response (not wrapped in data)", async () => {
      const mockWorkshop = { _id: "1", title: "React 101", slug: "react-101" };
      mockApiClient.mockResolvedValueOnce(mockWorkshop);

      const { fetchWorkshopBySlug } = await import("../services");
      const result = await fetchWorkshopBySlug("react-101");

      expect(result).toEqual(mockWorkshop);
    });
  });

  describe("createWorkshop", () => {
    it("should call apiClientFormData with POST /workshop/create", async () => {
      mockApiClientFormData.mockResolvedValueOnce({ id: "123" });

      const { createWorkshop } = await import("../services");
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: "Test" }));

      await createWorkshop(formData);

      expect(mockApiClientFormData).toHaveBeenCalledWith(
        "/workshop/create",
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });
  });

  describe("updateWorkshop", () => {
    it("should call apiClientFormData with PATCH /workshop/:id and FormData", async () => {
      mockApiClientFormData.mockResolvedValueOnce({ id: "123", title: "Updated" });

      const { updateWorkshop } = await import("../services");
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: "Updated" }));
      await updateWorkshop("123", formData);

      expect(mockApiClientFormData).toHaveBeenCalledWith(
        "/workshop/123",
        expect.objectContaining({
          method: "PATCH",
          body: formData,
        })
      );
    });
  });

  describe("deleteWorkshop", () => {
    it("should call apiClient with DELETE /workshop/:id", async () => {
      mockApiClient.mockResolvedValueOnce(undefined);

      const { deleteWorkshop } = await import("../services");
      await deleteWorkshop("123");

      expect(mockApiClient).toHaveBeenCalledWith("/workshop/123", {
        method: "DELETE",
      });
    });
  });

  describe("fetchCategories", () => {
    it("should call apiClient with /category", async () => {
      mockApiClient.mockResolvedValueOnce([]);

      const { fetchCategories } = await import("../services");
      await fetchCategories();

      expect(mockApiClient).toHaveBeenCalledWith("/category");
    });
  });

  describe("createCategory", () => {
    it("should call apiClientFormData with POST /category/create and FormData", async () => {
      mockApiClientFormData.mockResolvedValueOnce({ id: "1", name: "Web Dev" });

      const { createCategory } = await import("../services");
      const formData = new FormData();
      formData.append("name", "Web Dev");
      await createCategory(formData);

      expect(mockApiClientFormData).toHaveBeenCalledWith(
        "/category/create",
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });
  });

  describe("createEnrollment", () => {
    it("should call apiClient with POST /enrollment and workshop + studentCount", async () => {
      mockApiClient.mockResolvedValueOnce({ id: "1", workshopId: "w1" });

      const { createEnrollment } = await import("../services");
      await createEnrollment("w1", 1);

      expect(mockApiClient).toHaveBeenCalledWith(
        "/enrollment",
        expect.objectContaining({
          method: "POST",
          body: { workshop: "w1", studentCount: 1 },
        })
      );
    });
  });

  describe("initPayment", () => {
    it("should call apiClient with POST /payment/init-payment/:enrollmentId", async () => {
      mockApiClient.mockResolvedValueOnce({
        paymentUrl: "https://payment.example.com",
        transactionId: "txn-123",
      });

      const { initPayment } = await import("../services");
      const result = await initPayment("enrollment-1");

      expect(mockApiClient).toHaveBeenCalledWith(
        "/payment/init-payment/enrollment-1",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(result).toHaveProperty("paymentUrl");
      expect(result).toHaveProperty("transactionId");
    });
  });

  describe("sendOtp", () => {
    it("should call apiClient with POST /otp/send", async () => {
      mockApiClient.mockResolvedValueOnce({ message: "OTP sent" });

      const { sendOtp } = await import("../services");
      await sendOtp("test@test.com");

      expect(mockApiClient).toHaveBeenCalledWith(
        "/otp/send",
        expect.objectContaining({
          method: "POST",
          body: { email: "test@test.com" },
        })
      );
    });
  });

  describe("verifyOtp", () => {
    it("should call apiClient with POST /otp/verify", async () => {
      mockApiClient.mockResolvedValueOnce({ verified: true });

      const { verifyOtp } = await import("../services");
      await verifyOtp("test@test.com", "123456");

      expect(mockApiClient).toHaveBeenCalledWith(
        "/otp/verify",
        expect.objectContaining({
          method: "POST",
          body: { email: "test@test.com", otp: "123456" },
        })
      );
    });
  });

  describe("getUserStats", () => {
    it("should call apiClient with /stats/users", async () => {
      mockApiClient.mockResolvedValueOnce({
        totalUsers: 100,
        totalStudents: 80,
        totalInstructors: 15,
        totalAdmins: 5,
      });

      const { getUserStats } = await import("../services");
      const result = await getUserStats();

      expect(mockApiClient).toHaveBeenCalledWith("/stats/users");
      expect(result).toHaveProperty("totalUsers");
    });
  });

  describe("getWorkshopStats", () => {
    it("should call apiClient with /stats/workshops", async () => {
      mockApiClient.mockResolvedValueOnce({ totalWorkshops: 25, activeWorkshops: 10 });

      const { getWorkshopStats } = await import("../services");
      const result = await getWorkshopStats();

      expect(mockApiClient).toHaveBeenCalledWith("/stats/workshops");
      expect(result).toHaveProperty("totalWorkshops");
    });
  });

  describe("getEnrollmentStats", () => {
    it("should call apiClient with /stats/enrollment", async () => {
      mockApiClient.mockResolvedValueOnce({ totalEnrollments: 50 });

      const { getEnrollmentStats } = await import("../services");
      const result = await getEnrollmentStats();

      expect(mockApiClient).toHaveBeenCalledWith("/stats/enrollment");
      expect(result).toHaveProperty("totalEnrollments");
    });
  });

  describe("getPaymentStats", () => {
    it("should call apiClient with /stats/payment", async () => {
      mockApiClient.mockResolvedValueOnce({ totalRevenue: 50000 });

      const { getPaymentStats } = await import("../services");
      const result = await getPaymentStats();

      expect(mockApiClient).toHaveBeenCalledWith("/stats/payment");
      expect(result).toHaveProperty("totalRevenue");
    });
  });

  describe("getAuditLogs", () => {
    it("should call apiClientPaginated with /audit endpoint", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { getAuditLogs } = await import("../services");
      const result = await getAuditLogs();

      expect(mockApiClientPaginated).toHaveBeenCalledWith("/audit");
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
    });

    it("should append filter params when provided", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { getAuditLogs } = await import("../services");
      await getAuditLogs({
        page: 1,
        collectionName: "Workshop",
        action: "create",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      const callUrl = mockApiClientPaginated.mock.calls[0][0];
      expect(callUrl).toContain("collectionName=Workshop");
      expect(callUrl).toContain("action=create");
      expect(callUrl).toContain("startDate=2025-01-01");
      expect(callUrl).toContain("endDate=2025-12-31");
    });
  });

  describe("getAllUsers", () => {
    it("should call apiClientPaginated with /user/all-users endpoint", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { getAllUsers } = await import("../services");
      const result = await getAllUsers();

      expect(mockApiClientPaginated).toHaveBeenCalledWith("/user/all-users");
      expect(result).toHaveProperty("data");
    });

    it("should include search params when provided", async () => {
      mockApiClientPaginated.mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
      });

      const { getAllUsers } = await import("../services");
      await getAllUsers({ searchTerm: "john", page: 2 });

      const callUrl = mockApiClientPaginated.mock.calls[0][0];
      expect(callUrl).toContain("searchTerm=john");
      expect(callUrl).toContain("page=2");
      expect(callUrl).toContain("/user/all-users");
    });
  });

  describe("enrichWorkshops", () => {
    it("should return workshops with resolved category/level objects", async () => {
      const workshops = [{ _id: "1", title: "Test", category: "cat1", level: "lvl1" } as never];
      const categories = [{ _id: "cat1", name: "Web Dev", slug: "web-dev" }] as never;
      const levels = [{ _id: "lvl1", name: "Beginner" }] as never;

      const { enrichWorkshops } = await import("../services");
      const result = enrichWorkshops(workshops, categories, levels);

      expect(result[0].category).toEqual(categories[0]);
      expect(result[0].level).toEqual(levels[0]);
    });

    it("should pass through already-populated category/level objects", async () => {
      const workshops = [
        {
          _id: "1",
          title: "Test",
          category: { _id: "cat1", name: "Web Dev" },
          level: { _id: "lvl1", name: "Beginner" },
        } as never,
      ];

      const { enrichWorkshops } = await import("../services");
      const result = enrichWorkshops(workshops, [], []);

      expect(result[0].category).toEqual({ _id: "cat1", name: "Web Dev" });
      expect(result[0].level).toEqual({ _id: "lvl1", name: "Beginner" });
    });

    it("should leave category/level as-is when no match found", async () => {
      const workshops = [
        { _id: "1", title: "Test", category: "unknown", level: "unknown" } as never,
      ];

      const { enrichWorkshops } = await import("../services");
      const result = enrichWorkshops(workshops, [], []);

      expect(result[0].category).toBe("unknown");
      expect(result[0].level).toBe("unknown");
    });
  });
});
