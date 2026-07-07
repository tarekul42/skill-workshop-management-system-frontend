import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleApiError } from "../error-handler";
import { ApiError } from "../api-client";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const { toast } = await import("sonner");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleApiError", () => {
  it("should toast status-specific message for ApiError with known status", () => {
    handleApiError(new ApiError(404, "Not found"));
    expect(toast.error).toHaveBeenCalledWith("The requested resource was not found.");
  });

  it("should toast ApiError message for unknown status", () => {
    handleApiError(new ApiError(500, "Internal error"));
    expect(toast.error).toHaveBeenCalledWith("Internal error");
  });

  it("should use fallback message when ApiError has no status mapping", () => {
    handleApiError(new ApiError(418, "I'm a teapot"));
    expect(toast.error).toHaveBeenCalledWith("I'm a teapot");
  });

  it("should toast error message for generic Error", () => {
    handleApiError(new Error("Network failure"));
    expect(toast.error).toHaveBeenCalledWith("Network failure");
  });

  it("should use fallback for generic Error without message", () => {
    handleApiError(new Error(""));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
  });

  it("should use fallback for non-Error values", () => {
    handleApiError("some string");
    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
  });

  it("should use custom fallback message", () => {
    handleApiError(null, "Custom message");
    expect(toast.error).toHaveBeenCalledWith("Custom message");
  });

  it.each([
    [400, "Invalid request. Please check your input."],
    [401, "Your session has expired. Please log in again."],
    [403, "You don't have permission to perform this action."],
    [409, "This resource already exists."],
    [422, "Validation failed. Please check your input."],
    [429, "Too many requests. Please wait a moment and try again."],
  ])("should return correct message for status %i", (status, expected) => {
    handleApiError(new ApiError(status, ""));
    expect(toast.error).toHaveBeenCalledWith(expected);
  });
});
