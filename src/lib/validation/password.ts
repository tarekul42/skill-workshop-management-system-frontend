import { z } from "zod";

// Base password schema that enforces strict rules
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export interface PasswordCheck {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_CHECKS: PasswordCheck[] = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  return PASSWORD_CHECKS.filter((check) => check.test(password)).length;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordStrength(password) === PASSWORD_CHECKS.length;
}
