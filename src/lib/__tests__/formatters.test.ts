import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, getInitials, truncate } from "../formatters";

describe("formatter utilities", () => {
  describe("formatCurrency", () => {
    it("should format numbers to BDT currency", () => {
      // Note: Intl results can have non-breaking spaces
      const result = formatCurrency(1000).replace(/\s/g, " ");
      expect(result).toMatch(/BDT 1,000.00/);
    });
  });

  describe("formatDate", () => {
    it("should format date strings to Long format", () => {
      const result = formatDate("2024-03-20");
      expect(result).toBe("March 20, 2024");
    });
  });

  describe("getInitials", () => {
    it("should get initials from a full name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should handle single names", () => {
      expect(getInitials("Alice")).toBe("A");
    });

    it("should limit to 2 characters", () => {
      expect(getInitials("John Quincy Adams")).toBe("JQ");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("Hello World", 5)).toBe("Hello...");
    });

    it("should not truncate short strings", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });
  });
});
