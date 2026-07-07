import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { unwrapNestedData, safeParseResponse } from "../validate";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("unwrappedNestedData", () => {
  it("should unwrap nested data object", () => {
    const result = unwrapNestedData({ data: { _id: "123", name: "test" } });
    expect(result).toEqual({ _id: "123", name: "test" });
  });

  it("should return data as-is if no data property", () => {
    const result = unwrapNestedData({ _id: "123" });
    expect(result).toEqual({ _id: "123" });
  });

  it("should return null as-is", () => {
    const result = unwrapNestedData(null);
    expect(result).toBeNull();
  });

  it("should return undefined as-is", () => {
    const result = unwrapNestedData(undefined);
    expect(result).toBeUndefined();
  });
});

describe("safeParseResponse", () => {
  const schema = z.object({ name: z.string(), age: z.number() });

  it("should return parsed data for valid input", () => {
    const result = safeParseResponse({ name: "Alice", age: 30 }, schema);
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("should return raw data on validation failure in non-development", () => {
    vi.stubEnv("NODE_ENV", "production");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = safeParseResponse({ name: "Alice", age: "thirty" }, schema);
    expect(result).toEqual({ name: "Alice", age: "thirty" });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("should log error in development on validation failure", () => {
    vi.stubEnv("NODE_ENV", "development");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = safeParseResponse({ name: "Alice", age: "thirty" }, schema);
    expect(result).toEqual({ name: "Alice", age: "thirty" });
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
