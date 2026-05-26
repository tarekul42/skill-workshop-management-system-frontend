import { vi } from "vitest";

/**
 * Mock api-client module for all component/service tests.
 * Import and call `mockApiClient()` at the top of each test file,
 * then use the returned `apiClient` object to set up responses.
 */
export function mockApiClient() {
  const apiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  };

  vi.mock("@/lib/api/api-client", () => ({
    apiClient,
    default: apiClient,
  }));

  return apiClient;
}

/**
 * Standard success response wrapper matching the backend ApiResponse shape.
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
    message: "Success",
  };
}

/**
 * Standard paginated response wrapper.
 */
export function createPaginatedResponse<T>(items: T[], total: number, page: number, limit: number) {
  return {
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Standard error response wrapper.
 */
export function createErrorResponse(message: string, statusCode: number = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}
