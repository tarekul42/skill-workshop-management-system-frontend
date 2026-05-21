import { describe, it, expect } from "vitest";
import {
  PASSWORD_CHECKS,
  getPasswordStrength,
  isPasswordValid,
} from "../password";

describe("password validation", () => {
  describe("getPasswordStrength", () => {
    it("returns 0 for empty string", () => {
      expect(getPasswordStrength("")).toBe(0);
    });

    it("returns 0 for null/undefined-like empty", () => {
      expect(getPasswordStrength("")).toBe(0);
    });

    it("returns 2 for 'password' (length + lowercase only)", () => {
      // 'password': length>=8 ✓, lowercase ✓, uppercase ✗, number ✗, special ✗
      expect(getPasswordStrength("password")).toBe(2);
    });

    it("returns 5 for 'Password1!' (all checks pass)", () => {
      expect(getPasswordStrength("Password1!")).toBe(5);
    });

    it("returns 1 for a short uppercase-only string", () => {
      // 'A': length ✗, uppercase ✓, lowercase ✗, number ✗, special ✗
      expect(getPasswordStrength("A")).toBe(1);
    });

    it("returns 3 for 'Password' (length + upper + lower)", () => {
      expect(getPasswordStrength("Password")).toBe(3);
    });

    it("returns 4 for 'Password1' (length + upper + lower + number)", () => {
      expect(getPasswordStrength("Password1")).toBe(4);
    });
  });

  describe("isPasswordValid", () => {
    it("returns false for empty string", () => {
      expect(isPasswordValid("")).toBe(false);
    });

    it("returns false for 'password'", () => {
      expect(isPasswordValid("password")).toBe(false);
    });

    it("returns true for 'Password1!'", () => {
      expect(isPasswordValid("Password1!")).toBe(true);
    });

    it("returns true for a complex password", () => {
      expect(isPasswordValid("MyP@ssw0rd")).toBe(true);
    });

    it("returns false for password missing special character", () => {
      expect(isPasswordValid("Password1")).toBe(false);
    });
  });

  describe("PASSWORD_CHECKS", () => {
    it("has exactly 5 checks", () => {
      expect(PASSWORD_CHECKS).toHaveLength(5);
    });

    it("length check: passes for 8+ chars, fails for <8", () => {
      const check = PASSWORD_CHECKS.find((c) => c.id === "length")!;
      expect(check.test("12345678")).toBe(true);
      expect(check.test("1234567")).toBe(false);
      expect(check.test("")).toBe(false);
    });

    it("uppercase check: passes with uppercase, fails without", () => {
      const check = PASSWORD_CHECKS.find((c) => c.id === "upper")!;
      expect(check.test("A")).toBe(true);
      expect(check.test("Password")).toBe(true);
      expect(check.test("password")).toBe(false);
      expect(check.test("123!@#")).toBe(false);
    });

    it("lowercase check: passes with lowercase, fails without", () => {
      const check = PASSWORD_CHECKS.find((c) => c.id === "lower")!;
      expect(check.test("a")).toBe(true);
      expect(check.test("Password")).toBe(true);
      expect(check.test("PASSWORD")).toBe(false);
      expect(check.test("123!@#")).toBe(false);
    });

    it("number check: passes with digit, fails without", () => {
      const check = PASSWORD_CHECKS.find((c) => c.id === "number")!;
      expect(check.test("1")).toBe(true);
      expect(check.test("Pass1word")).toBe(true);
      expect(check.test("Password!")).toBe(false);
    });

    it("special character check: passes with special char, fails without", () => {
      const check = PASSWORD_CHECKS.find((c) => c.id === "special")!;
      expect(check.test("!")).toBe(true);
      expect(check.test("Pass@word1")).toBe(true);
      expect(check.test("Password1")).toBe(false);
      expect(check.test("abcdefgh")).toBe(false);
    });

    it("each check has id, label, and test function", () => {
      PASSWORD_CHECKS.forEach((check) => {
        expect(check.id).toBeTruthy();
        expect(check.label).toBeTruthy();
        expect(typeof check.test).toBe("function");
      });
    });
  });
});
