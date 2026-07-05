import { z } from "zod";

/**
 * Unwraps a double-nested API response like `{ data: T }` to `T`.
 * Some backend endpoints return `{ success, data: { data: T } }` (double nesting),
 * which the api-client's `json.data` unwraps to `{ data: T }` instead of `T`.
 */
export function unwrapNestedData<T>(data: unknown): T {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/**
 * Safely validates an API response against a Zod schema.
 * Returns the parsed data on success.
 * On validation failure, returns the raw data as a fallback (graceful degradation)
 * and logs the mismatch in development.
 */
export function safeParseResponse<T>(
  data: unknown,
  schema: z.ZodType<T>,
  label = "API response"
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  if (process.env.NODE_ENV === "development") {
    console.error(`[API] ${label} shape mismatch:`, result.error.issues);
  }

  return data as T;
}
