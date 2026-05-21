import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
  truncate,
  computeDuration,
} from "../formatters";

describe("formatter utilities", () => {
  describe("formatCurrency", () => {
    it("should format numbers to BDT currency", () => {
      // Note: Intl results can have non-breaking spaces
      const result = formatCurrency(1000).replace(/\s/g, " ");
      expect(result).toMatch(/BDT 1,000\.00/);
    });

    it("formats 0 as BDT 0.00", () => {
      const result = formatCurrency(0).replace(/\s/g, " ");
      expect(result).toMatch(/BDT\s*0\.00/);
    });

    it("formats 12500 as BDT 12,500.00", () => {
      const result = formatCurrency(12500).replace(/\s/g, " ");
      expect(result).toMatch(/BDT\s*12,500\.00/);
    });
  });

  describe("formatDate", () => {
    it("should format date strings to Long format", () => {
      const result = formatDate("2024-03-20");
      expect(result).toBe("March 20, 2024");
    });
  });

  describe("formatDateTime", () => {
    it("returns a string containing both date and time components", () => {
      const result = formatDateTime("2024-06-15T10:30:00Z");
      // Should contain a year
      expect(result).toMatch(/2024/);
      // Should contain AM or PM (12-hour format) or a colon (time separator)
      expect(result).toMatch(/AM|PM|:/);
    });

    it("returns a non-empty string for a valid date", () => {
      const result = formatDateTime("2024-01-01T00:00:00Z");
      expect(result.length).toBeGreaterThan(0);
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

  describe("computeDuration", () => {
    it("returns '1 week' for a 7-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-08")).toBe("1 week");
    });

    it("returns '2 weeks' for a 14-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-15")).toBe("2 weeks");
    });

    it("returns '3 days' for a 3-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-04")).toBe("3 days");
    });

    it("returns '1 week 3 days' for a 10-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-11")).toBe("1 week 3 days");
    });

    it("returns '1 day' for a 1-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-02")).toBe("1 day");
    });

    it("returns '3 weeks' for a 21-day span", () => {
      expect(computeDuration("2024-01-01", "2024-01-22")).toBe("3 weeks");
    });
  });
});
