/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  login,
  registerUser,
  getMe,
  getAllUsers,
  fetchWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  fetchWorkshopLevels,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createEnrollment,
  getAllEnrollments,
  getMyEnrollments,
  initPayment,
  sendOtp,
  verifyOtp,
  getWorkshopReviews,
  getWorkshopReviewStats,
  createReview,
  updateReview,
  deleteReview,
  submitContact,
  fetchAdminDashboard,
  getEnrollmentStats,
  getPaymentStats,
  getUserStats,
  getWorkshopStats,
  getAuditLogs,
  getInvoice,
  refundPayment,
  updateEnrollmentStatus,
  deleteEnrollment,
  getEnrollmentById,
  getUserReviewForWorkshop,
  refreshToken,
  logout,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
  getWorkshopLevelById,
  createLevel,
  updateLevel,
  deleteLevel,
  fetchWorkshopBySlug,
  fetchWorkshopById,
  fetchCategoryBySlug,
  getUserById,
  updateUser,
  deleteUser,
} from "../services";

const mockApiClient = vi.fn();
const mockFormData = vi.fn();
const mockPaginated = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
  apiClientFormData: (...args: unknown[]) => mockFormData(...args),
  apiClientPaginated: (...args: unknown[]) => mockPaginated(...args),
}));

function paginated<T>(items: T[], total = 0) {
  return { data: items, meta: { page: 1, limit: 10, total, totalPage: Math.ceil(total / 10) } };
}

describe("services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPaginated.mockResolvedValue(paginated([]));
  });

  // ── Auth ───────────────────────────────────────────────────────

  describe("login", () => {
    it("posts to /auth/login with credentials", async () => {
      mockApiClient.mockResolvedValue({ token: "abc" });
      const result = await login("test@test.com", "pass123");
      expect(mockApiClient).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: { email: "test@test.com", password: "pass123" },
      });
      expect(result).toEqual({ token: "abc" });
    });
  });

  describe("refreshToken", () => {
    it("posts to /auth/refresh-token", async () => {
      mockApiClient.mockResolvedValue({ accessToken: "new" });
      const result = await refreshToken();
      expect(mockApiClient).toHaveBeenCalledWith("/auth/refresh-token", { method: "POST" });
      expect(result).toEqual({ accessToken: "new" });
    });
  });

  describe("logout", () => {
    it("posts to /auth/logout", async () => {
      mockApiClient.mockResolvedValue(undefined);
      await logout();
      expect(mockApiClient).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
    });
  });

  // ── User ───────────────────────────────────────────────────────

  describe("registerUser", () => {
    it("posts to /user/register with JSON body", async () => {
      mockApiClient.mockResolvedValue({ _id: "u1" });
      const result = await registerUser({
        name: "Test",
        email: "t@t.com",
        password: "P@ss1",
      });
      expect(mockApiClient).toHaveBeenCalledWith("/user/register", {
        method: "POST",
        body: { name: "Test", email: "t@t.com", password: "P@ss1" },
      });
      expect(result).toEqual({ _id: "u1" });
    });

    it("uses FormData when FormData is passed", async () => {
      const formData = new FormData();
      formData.append("name", "Test");
      formData.append("email", "t@t.com");
      formData.append("password", "P@ss1");
      const file = new File([""], "pic.jpg", { type: "image/jpeg" });
      formData.append("file", file);
      mockFormData.mockResolvedValue({ _id: "u1" });
      const result = await registerUser(formData);
      expect(mockFormData).toHaveBeenCalledWith("/user/register", {
        method: "POST",
        body: formData,
      });
      expect(result).toEqual({ _id: "u1" });
    });
  });

  describe("getMe", () => {
    it("gets /user/me", async () => {
      mockApiClient.mockResolvedValue({ _id: "u1" });
      const result = await getMe();
      expect(mockApiClient).toHaveBeenCalledWith("/user/me");
      expect(result).toEqual({ _id: "u1" });
    });
  });

  describe("getAllUsers", () => {
    it("fetches users with pagination params", async () => {
      mockPaginated.mockResolvedValue(paginated([{ _id: "u1" }], 1));
      const result = await getAllUsers({ page: 1, limit: 10 });
      expect(mockPaginated).toHaveBeenCalledWith(expect.stringContaining("/user/all-users"));
      expect(result.data).toHaveLength(1);
    });
  });

  // ── Workshop ───────────────────────────────────────────────────

  describe("fetchWorkshops", () => {
    it("fetches workshops with query params", async () => {
      mockPaginated.mockResolvedValue(paginated([{ _id: "w1", title: "React" }], 1));
      const result = await fetchWorkshops({ page: 1, limit: 10, category: "programming" });
      expect(mockPaginated).toHaveBeenCalledWith(expect.stringContaining("category=programming"));
      expect(result.data).toHaveLength(1);
    });

    it("handles search and sort params", async () => {
      mockPaginated.mockResolvedValue(paginated([]));
      await fetchWorkshops({ search: "react", sort: "price", page: 1, limit: 10 });
      expect(mockPaginated).toHaveBeenCalledWith(expect.stringContaining("search=react"));
      expect(mockPaginated).toHaveBeenCalledWith(expect.stringContaining("sort=price"));
    });
  });

  describe("createWorkshop", () => {
    it("posts form data", async () => {
      mockFormData.mockResolvedValue({ _id: "w1" });
      const form = new FormData();
      form.append("title", "New Workshop");
      const result = await createWorkshop(form);
      expect(mockFormData).toHaveBeenCalledWith("/workshop/create", { method: "POST", body: form });
      expect(result).toEqual({ _id: "w1" });
    });
  });

  describe("updateWorkshop", () => {
    it("patches with form data", async () => {
      mockFormData.mockResolvedValue({ _id: "w1" });
      const form = new FormData();
      form.append("title", "Updated");
      const result = await updateWorkshop("w1", form);
      expect(mockFormData).toHaveBeenCalledWith("/workshop/w1", { method: "PATCH", body: form });
      expect(result).toEqual({ _id: "w1" });
    });
  });

  describe("deleteWorkshop", () => {
    it("deletes /workshop/:id", async () => {
      mockApiClient.mockResolvedValue(undefined);
      await deleteWorkshop("w1");
      expect(mockApiClient).toHaveBeenCalledWith("/workshop/w1", { method: "DELETE" });
    });
  });

  // ── Category ───────────────────────────────────────────────────

  describe("fetchCategories", () => {
    it("gets /category", async () => {
      mockApiClient.mockResolvedValue([]);
      const result = await fetchCategories();
      expect(mockApiClient).toHaveBeenCalledWith("/category");
      expect(result).toEqual([]);
    });
  });

  describe("createCategory", () => {
    it("posts to /category/create with form data", async () => {
      mockFormData.mockResolvedValue({ _id: "c1" });
      const form = new FormData();
      form.append("name", "New Cat");
      const result = await createCategory(form);
      expect(mockFormData).toHaveBeenCalledWith("/category/create", { method: "POST", body: form });
      expect(result).toEqual({ _id: "c1" });
    });
  });

  // ── Enrollment ─────────────────────────────────────────────────

  describe("createEnrollment", () => {
    it("posts to /enrollment", async () => {
      mockApiClient.mockResolvedValue({ _id: "e1" });
      const result = await createEnrollment("w1", 1);
      expect(mockApiClient).toHaveBeenCalledWith("/enrollment", {
        method: "POST",
        body: { workshop: "w1", studentCount: 1 },
      });
      expect(result).toEqual({ _id: "e1" });
    });
  });

  describe("getMyEnrollments", () => {
    it("returns validated enrollment array", async () => {
      mockApiClient.mockResolvedValue([{ _id: "e1", workshop: { _id: "w1", title: "React" } }]);
      const result = await getMyEnrollments();
      expect(mockApiClient).toHaveBeenCalledWith("/enrollment/my-enrollments");
      expect(result).toHaveLength(1);
    });
  });

  // ── Payment ────────────────────────────────────────────────────

  describe("initPayment", () => {
    it("posts to /payment/init-payment/:id", async () => {
      mockApiClient.mockResolvedValue({ paymentUrl: "https://..." });
      const result = await initPayment("e1");
      expect(mockApiClient).toHaveBeenCalledWith("/payment/init-payment/e1", { method: "POST" });
      expect(result).toEqual({ paymentUrl: "https://..." });
    });
  });

  // ── OTP ────────────────────────────────────────────────────────

  describe("sendOtp", () => {
    it("posts to /otp/send", async () => {
      mockApiClient.mockResolvedValue(undefined);
      await sendOtp("user@test.com");
      expect(mockApiClient).toHaveBeenCalledWith("/otp/send", {
        method: "POST",
        body: { email: "user@test.com" },
      });
    });
  });

  describe("verifyOtp", () => {
    it("posts to /otp/verify", async () => {
      mockApiClient.mockResolvedValue(undefined);
      const result = await verifyOtp("user@test.com", "123456");
      expect(mockApiClient).toHaveBeenCalledWith("/otp/verify", {
        method: "POST",
        body: { email: "user@test.com", otp: "123456" },
      });
      expect(result).toBeUndefined();
    });
  });

  // ── Review ─────────────────────────────────────────────────────

  describe("getWorkshopReviews", () => {
    it("gets reviews with pagination params", async () => {
      mockApiClient.mockResolvedValue({
        data: [{ _id: "r1" }],
        meta: { page: 1, limit: 10, total: 1, totalPage: 1 },
      });
      const result = await getWorkshopReviews("w1", { page: 1, limit: 10 });
      expect(mockApiClient).toHaveBeenCalledWith(expect.stringContaining("/review/workshop/w1"));
      expect(result.data).toHaveLength(1);
    });
  });

  describe("createReview", () => {
    it("posts to /review", async () => {
      mockApiClient.mockResolvedValue({ _id: "r1" });
      const result = await createReview({
        workshop: "w1",
        rating: 5,
        title: "Great!",
        content: "Loved it",
      });
      expect(mockApiClient).toHaveBeenCalledWith("/review", {
        method: "POST",
        body: { workshop: "w1", rating: 5, title: "Great!", content: "Loved it" },
      });
      expect(result).toEqual({ _id: "r1" });
    });
  });

  // ── Contact ────────────────────────────────────────────────────

  describe("submitContact", () => {
    it("posts to /contact", async () => {
      mockApiClient.mockResolvedValue({ _id: "c1" });
      const data = { name: "Test", email: "t@t.com", subject: "Hi", message: "Hello there!" };
      const result = await submitContact(data);
      expect(mockApiClient).toHaveBeenCalledWith("/contact", { method: "POST", body: data });
      expect(result).toEqual({ _id: "c1" });
    });
  });

  // ── Stats ──────────────────────────────────────────────────────

  describe("getEnrollmentStats", () => {
    it("gets /stats/enrollment", async () => {
      mockApiClient.mockResolvedValue({ totalEnrollments: 42 });
      const result = await getEnrollmentStats();
      expect(mockApiClient).toHaveBeenCalledWith("/stats/enrollment");
      expect(result).toEqual({ totalEnrollments: 42 });
    });
  });

  describe("getWorkshopStats", () => {
    it("gets /stats/workshops", async () => {
      mockApiClient.mockResolvedValue({ totalWorkshops: 10 });
      const result = await getWorkshopStats();
      expect(mockApiClient).toHaveBeenCalledWith("/stats/workshops");
      expect(result).toEqual({ totalWorkshops: 10 });
    });
  });

  // ── Audit ──────────────────────────────────────────────────────

  describe("getAuditLogs", () => {
    it("gets audit logs with params", async () => {
      mockPaginated.mockResolvedValue(paginated([]));
      await getAuditLogs({ page: 1, limit: 10 });
      expect(mockPaginated).toHaveBeenCalledWith(expect.stringContaining("/audit"));
    });
  });

  // ── Admin Dashboard ────────────────────────────────────────────

  describe("fetchAdminDashboard", () => {
    it("returns consolidated stats", async () => {
      mockApiClient.mockResolvedValue({ users: {}, workshops: {}, enrollments: {}, payments: {} });
      const result = await fetchAdminDashboard();
      expect(mockApiClient).toHaveBeenCalledWith("/stats/dashboard");
      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("workshops");
      expect(result).toHaveProperty("enrollments");
      expect(result).toHaveProperty("payments");
    });
  });

  // ── Edge: error handling ───────────────────────────────────────

  describe("error handling", () => {
    it("throws on network error", async () => {
      mockApiClient.mockRejectedValue(new Error("Network failure"));
      await expect(getMe()).rejects.toThrow("Network failure");
    });

    it("throws non-Error objects as strings", async () => {
      mockApiClient.mockRejectedValue("string error");
      await expect(getMe()).rejects.toThrow("string error");
    });
  });
});
