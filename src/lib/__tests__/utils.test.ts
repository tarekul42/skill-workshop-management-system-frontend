import { describe, it, expect } from "vitest";
import { cn, isValidUrl } from "../utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("px-4", "py-2")).toContain("px-4");
    expect(cn("px-4", "py-2")).toContain("py-2");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", true && "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("should handle undefined values", () => {
    expect(cn("a", undefined, "b")).toContain("a");
    expect(cn("a", undefined, "b")).toContain("b");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("isValidUrl", () => {
  it("should return true for valid https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("should return true for valid http URLs", () => {
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("should return false for empty strings", () => {
    expect(isValidUrl("")).toBe(false);
  });
});
