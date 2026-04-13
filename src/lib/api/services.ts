import {
  apiClient,
  apiClientFormData,
  apiClientPaginated,
} from "@/lib/api-client";
import { BACKEND_API_URL } from "@/lib/constants";
import type {
  IWorkshop,
  ICategory,
  ILevel,
  IUser,
  IEnrollment,
  IPayment,
  IAuditLog,
  EnrollmentStatus,
  PaginationMeta,
  UserStats,
  WorkshopStats,
  EnrollmentStats,
  PaymentStats,
} from "@/types";

// ─── Shared parameter types ─────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FetchWorkshopsParams extends PaginationParams {
  searchTerm?: string;
  category?: string;
  level?: string;
  sort?: string;
}

export interface FetchUsersParams extends PaginationParams {
  searchTerm?: string;
}

export interface FetchAuditLogsParams extends PaginationParams {
  collectionName?: string;
  action?: string;
  performedBy?: string;
  documentId?: string;
  startDate?: string;
  endDate?: string;
}

// ─── Response helpers ───────────────────────────────────────────────

export interface PaginatedData<T> {
  data: T;
  meta: PaginationMeta;
}

// ─── Auth response types ────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  transactionId: string;
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Log in with email and password.
 * Returns tokens and the authenticated user object.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/**
 * Refresh the access token using a stored refresh token / cookie.
 */
export async function refreshToken(): Promise<{ accessToken: string }> {
  return apiClient<{ accessToken: string }>("/auth/refresh-token", {
    method: "POST",
  });
}

/**
 * Log the current user out.
 */
export async function logout(): Promise<void> {
  return apiClient<void>("/auth/logout", { method: "POST" });
}

/**
 * Change the authenticated user's password.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return apiClient<void>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

/**
 * Request a password-reset email.
 */
export async function forgotPassword(email: string): Promise<void> {
  return apiClient<void>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

/**
 * Reset password using the token received via email.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  return apiClient<void>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// USER SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Register a new user account.
 * Accepts either JSON (object) or FormData (if file upload is needed).
 */
export async function registerUser(
  data:
    | FormData
    | {
        name: string;
        email: string;
        password: string;
        phone?: string;
        age?: number;
        address?: string;
      }
): Promise<IUser> {
  if (data instanceof FormData) {
    return apiClientFormData<IUser>("/user/register", {
      method: "POST",
      body: data,
    });
  }
  return apiClient<IUser>("/user/register", {
    method: "POST",
    body: data,
  });
}

/**
 * Get the currently authenticated user's profile.
 */
export async function getMe(): Promise<IUser> {
  return apiClient<IUser>("/user/me");
}

/**
 * Get all users (admin). Returns paginated results.
 */
export async function getAllUsers(
  params?: FetchUsersParams
): Promise<PaginatedData<IUser[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);

  const qs = searchParams.toString();
  const endpoint = `/user/all-users${qs ? `?${qs}` : ""}`;

  return apiClientPaginated<IUser[]>(endpoint);
}

/**
 * Get a single user by ID.
 */
export async function getUserById(id: string): Promise<IUser> {
  return apiClient<IUser>(`/user/${id}`);
}

/**
 * Update a user's profile by ID (admin or self).
 * Accepts partial IUser fields.
 */
export async function updateUser(
  id: string,
  data: Partial<
    Pick<IUser, "name" | "email" | "phone" | "age" | "address" | "isActive" | "role">
  >
): Promise<IUser> {
  return apiClient<IUser>(`/user/${id}`, {
    method: "PATCH",
    body: data,
  });
}

/**
 * Delete a user by ID (admin only).
 */
export async function deleteUser(id: string): Promise<void> {
  return apiClient<void>(`/user/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// WORKSHOP SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch a paginated list of workshops with optional filters.
 * Uses raw `fetch` because the response includes `meta` alongside `data`.
 */
export async function fetchWorkshops(
  params?: FetchWorkshopsParams
): Promise<PaginatedData<IWorkshop[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.searchTerm) searchParams.set("searchTerm", params.searchTerm);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.level) searchParams.set("level", params.level);
  if (params?.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  const url = `${BACKEND_API_URL}/workshop${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  const json = await res.json();

  return {
    data: json.data,
    meta: json.meta,
  };
}

/**
 * Fetch a single workshop by its URL slug.
 * Uses raw `fetch` (public endpoint).
 */
export async function fetchWorkshopBySlug(slug: string): Promise<IWorkshop> {
  const res = await fetch(`${BACKEND_API_URL}/workshop/${slug}`);
  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Failed to fetch workshop: ${slug}`);
  }

  // Handle double-nested response: { success, data: { data: {...} } }
  return json.data.data ?? json.data;
}

/**
 * Create a new workshop (multipart/form-data).
 *
 * Build a `FormData` object and call this function. Example fields:
 *   title, description, location, price, startDate, endDate,
 *   level (category id), category (level id),
 *   whatYouLearn[], prerequisites[], benefits[], syllabus[],
 *   maxSeats, minAge, files[]
 */
export async function createWorkshop(formData: FormData): Promise<IWorkshop> {
  return apiClientFormData<IWorkshop>("/workshop/create", {
    method: "POST",
    body: formData,
  });
}

/**
 * Update an existing workshop by ID (multipart/form-data).
 *
 * Same fields as create, plus an optional `deleteImages[]` field
 * containing image URLs that should be removed.
 */
export async function updateWorkshop(
  id: string,
  formData: FormData
): Promise<IWorkshop> {
  return apiClientFormData<IWorkshop>(`/workshop/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Delete a workshop by ID.
 */
export async function deleteWorkshop(id: string): Promise<void> {
  return apiClient<void>(`/workshop/${id}`, { method: "DELETE" });
}

// ─── Workshop Levels ────────────────────────────────────────────────

/**
 * Fetch all workshop difficulty levels.
 * Uses raw `fetch` (public endpoint).
 */
export async function fetchWorkshopLevels(): Promise<ILevel[]> {
  const res = await fetch(`${BACKEND_API_URL}/workshop/levels`);
  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? "Failed to fetch workshop levels");
  }

  // Handle double-nested response: { success, data: { data: [...], meta } }
  return json.data.data ?? json.data;
}

/**
 * Fetch a single workshop by ID.
 * Uses raw `fetch` (handles double-nested response from detail endpoint).
 */
export async function fetchWorkshopById(id: string): Promise<IWorkshop> {
  const res = await fetch(`${BACKEND_API_URL}/workshop/${id}`);
  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Failed to fetch workshop: ${id}`);
  }

  // Handle double-nested response: { success, data: { data: {...} } }
  return json.data.data ?? json.data;
}

// ─── Workshop Enrichment Helpers ────────────────────────────────────

/**
 * Safely extract the category name from a workshop field that may be
 * a plain ObjectId string or a populated ICategory object.
 */
export function getCategoryName(
  category: string | ICategory | undefined
): string {
  if (!category || typeof category === "string") return "";
  return category.name ?? "";
}

/**
 * Safely extract the level name from a workshop field that may be
 * a plain ObjectId string or a populated ILevel object.
 */
export function getLevelName(
  level: string | ILevel | undefined
): string {
  if (!level || typeof level === "string") return "";
  return level.name ?? "";
}

/**
 * Safely extract the category _id from a workshop field that may be
 * a plain ObjectId string or a populated ICategory object.
 */
export function getCategoryId(
  category: string | ICategory | undefined
): string {
  if (!category) return "";
  return typeof category === "string" ? category : category._id ?? "";
}

/**
 * Safely extract the level _id from a workshop field that may be
 * a plain ObjectId string or a populated ILevel object.
 */
export function getLevelId(
  level: string | ILevel | undefined
): string {
  if (!level) return "";
  return typeof level === "string" ? level : level._id ?? "";
}

/**
 * Safely extract the creator name from a workshop's createdBy field that
 * may be a plain ObjectId string or a populated user object.
 */
export function getCreatorName(
  createdBy: string | { _id: string; name: string; email: string } | undefined
): string {
  if (!createdBy || typeof createdBy === "string") return "";
  return createdBy.name ?? "";
}

/**
 * Resolve category/level ObjectId strings to full objects.
 * If the value is already a populated object, returns it as-is.
 */
export function enrichWorkshop(
  workshop: IWorkshop,
  categories: ICategory[],
  levels: ILevel[]
): IWorkshop {
  return {
    ...workshop,
    category:
      typeof workshop.category === "string"
        ? (categories.find((c) => c._id === workshop.category) as ICategory) ??
          workshop.category
        : workshop.category,
    level:
      typeof workshop.level === "string"
        ? (levels.find((l) => l._id === workshop.level) as ILevel) ??
          workshop.level
        : workshop.level,
  };
}

/**
 * Enrich an array of workshops with resolved category/level objects.
 */
export function enrichWorkshops(
  workshops: IWorkshop[],
  categories: ICategory[],
  levels: ILevel[]
): IWorkshop[] {
  return workshops.map((w) => enrichWorkshop(w, categories, levels));
}

/**
 * Fetch a single level by ID.
 */
export async function getWorkshopLevelById(id: string): Promise<ILevel> {
  return apiClient<ILevel>(`/workshop/levels/${id}`);
}

/**
 * Create a new workshop level.
 */
export async function createLevel(name: string): Promise<ILevel> {
  return apiClient<ILevel>("/workshop/create-level", {
    method: "POST",
    body: { name },
  });
}

/**
 * Rename an existing workshop level.
 */
export async function updateLevel(id: string, name: string): Promise<ILevel> {
  return apiClient<ILevel>(`/workshop/levels/${id}`, {
    method: "PATCH",
    body: { name },
  });
}

/**
 * Delete a workshop level by ID.
 */
export async function deleteLevel(id: string): Promise<void> {
  return apiClient<void>(`/workshop/levels/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch all workshop categories.
 * Uses raw `fetch` (public endpoint).
 */
export async function fetchCategories(): Promise<ICategory[]> {
  const res = await fetch(`${BACKEND_API_URL}/category`);
  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? "Failed to fetch categories");
  }

  return json.data;
}

/**
 * Fetch a single category by its URL slug.
 * Uses raw `fetch` (public endpoint).
 */
export async function fetchCategoryBySlug(slug: string): Promise<ICategory> {
  const res = await fetch(`${BACKEND_API_URL}/category/${slug}`);
  const json = await res.json();

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Failed to fetch category: ${slug}`);
  }

  return json.data;
}

/**
 * Create a new category (multipart/form-data).
 * Fields: name, description?, file (thumbnail image)
 */
export async function createCategory(formData: FormData): Promise<ICategory> {
  return apiClientFormData<ICategory>("/category/create", {
    method: "POST",
    body: formData,
  });
}

/**
 * Update an existing category by ID (multipart/form-data).
 * Fields: name, description?, file (thumbnail image)
 */
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ICategory> {
  return apiClientFormData<ICategory>(`/category/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient<void>(`/category/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// ENROLLMENT SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a new enrollment for a workshop.
 */
export async function createEnrollment(
  workshop: string,
  studentCount: number
): Promise<IEnrollment> {
  return apiClient<IEnrollment>("/enrollment", {
    method: "POST",
    body: { workshop, studentCount },
  });
}

/**
 * Fetch all enrollments (admin). Returns paginated results.
 */
export async function getAllEnrollments(
  params?: PaginationParams
): Promise<PaginatedData<IEnrollment[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  const endpoint = `/enrollment${qs ? `?${qs}` : ""}`;

  return apiClientPaginated<IEnrollment[]>(endpoint);
}

/**
 * Fetch the current user's own enrollments.
 */
export async function getMyEnrollments(): Promise<IEnrollment[]> {
  return apiClient<IEnrollment[]>("/enrollment/my-enrollments");
}

/**
 * Fetch a single enrollment by ID.
 */
export async function getEnrollmentById(id: string): Promise<IEnrollment> {
  return apiClient<IEnrollment>(`/enrollment/${id}`);
}

/**
 * Update the status of an enrollment (admin).
 */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus
): Promise<IEnrollment> {
  return apiClient<IEnrollment>(`/enrollment/${enrollmentId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

/**
 * Delete an enrollment by ID.
 */
export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  return apiClient<void>(`/enrollment/${enrollmentId}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// PAYMENT SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Initiate a payment for an enrollment.
 * Returns the payment gateway URL and transaction ID.
 */
export async function initPayment(
  enrollmentId: string
): Promise<PaymentInitResponse> {
  return apiClient<PaymentInitResponse>(
    `/payment/init-payment/${enrollmentId}`,
    { method: "POST" }
  );
}

/**
 * Validate a completed payment using the gateway validation ID.
 */
export async function validatePayment(
  val_id: string
): Promise<IPayment> {
  return apiClient<IPayment>("/payment/validate-payment", {
    method: "POST",
    body: { val_id },
  });
}

/**
 * Refund a payment.
 */
export async function refundPayment(
  paymentId: string,
  reason: string
): Promise<IPayment> {
  return apiClient<IPayment>("/payment/refund", {
    method: "POST",
    body: { paymentId, reason },
  });
}

/**
 * Get the invoice URL / data for a payment.
 */
export async function getInvoice(paymentId: string): Promise<{ invoiceUrl: string }> {
  return apiClient<{ invoiceUrl: string }>(`/payment/invoice/${paymentId}`);
}

// ═══════════════════════════════════════════════════════════════════════
// OTP SERVICES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Send an OTP to the given email address.
 */
export async function sendOtp(email: string): Promise<void> {
  return apiClient<void>("/otp/send", {
    method: "POST",
    body: { email },
  });
}

/**
 * Verify an OTP code against the given email.
 */
export async function verifyOtp(email: string, otp: string): Promise<void> {
  return apiClient<void>("/otp/verify", {
    method: "POST",
    body: { email, otp },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// STATS SERVICES (admin only)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch enrollment-related statistics (admin).
 */
export async function getEnrollmentStats(): Promise<EnrollmentStats> {
  return apiClient<EnrollmentStats>("/stats/enrollment");
}

/**
 * Fetch payment-related statistics (admin).
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  return apiClient<PaymentStats>("/stats/payment");
}

/**
 * Fetch user-related statistics (admin).
 */
export async function getUserStats(): Promise<UserStats> {
  return apiClient<UserStats>("/stats/users");
}

/**
 * Fetch workshop-related statistics (admin).
 */
export async function getWorkshopStats(): Promise<WorkshopStats> {
  return apiClient<WorkshopStats>("/stats/workshops");
}

// ═══════════════════════════════════════════════════════════════════════
// AUDIT LOG SERVICES (admin only)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch audit logs with optional filters (admin). Returns paginated results.
 */
export async function getAuditLogs(
  params?: FetchAuditLogsParams
): Promise<PaginatedData<IAuditLog[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.collectionName) searchParams.set("collectionName", params.collectionName);
  if (params?.action) searchParams.set("action", params.action);
  if (params?.performedBy) searchParams.set("performedBy", params.performedBy);
  if (params?.documentId) searchParams.set("documentId", params.documentId);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);

  const qs = searchParams.toString();
  const endpoint = `/audit${qs ? `?${qs}` : ""}`;

  return apiClientPaginated<IAuditLog[]>(endpoint);
}

/**
 * Fetch a single audit log by ID.
 */
export async function getAuditLogById(id: string): Promise<IAuditLog> {
  return apiClient<IAuditLog>(`/audit/${id}`);
}
