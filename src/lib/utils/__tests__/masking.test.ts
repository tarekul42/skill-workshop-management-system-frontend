import { describe, it, expect } from "vitest";
import { maskEmail, maskPhone, maskName } from "../masking";

describe("masking utilities", () => {
  describe("maskEmail", () => {
    it("should mask a standard email address", () => {
      expect(maskEmail("john.doe@example.com")).toBe("j******e@example.com");
    });

    it("should handle short local parts", () => {
      expect(maskEmail("jo@example.com")).toBe("j***@example.com");
    });

    it("should return N/A for empty input", () => {
      expect(maskEmail("")).toBe("N/A");
      expect(maskEmail(null)).toBe("N/A");
      expect(maskEmail(undefined)).toBe("N/A");
    });

    it("should handle invalid email formats gracefully", () => {
      expect(maskEmail("invalid-email")).toBe("invalid-email");
    });
  });

  describe("maskPhone", () => {
    it("should mask a phone number showing only last 4 digits", () => {
      expect(maskPhone("+8801712345678")).toBe("**********5678");
    });

    it("should handle short phone numbers", () => {
      expect(maskPhone("123")).toBe("****");
    });

    it("should return N/A for empty input", () => {
      expect(maskPhone("")).toBe("N/A");
    });
  });

  describe("maskName", () => {
    it("should mask a full name", () => {
      expect(maskName("John Doe")).toBe("J*** D**");
    });

    it("should mask a single name", () => {
      expect(maskName("Alice")).toBe("A****");
    });

    it("should return N/A for empty input", () => {
      expect(maskName("")).toBe("N/A");
    });
  });
});
