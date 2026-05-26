import { vi } from "vitest";

/**
 * Mock Next.js navigation hooks.
 * Call mockNextNavigation() at the top of any test file
 * that renders components using useRouter, usePathname, or useSearchParams.
 */
export function mockNextNavigation(overrides: Record<string, unknown> = {}) {
  vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      ...overrides,
    })),
    usePathname: vi.fn(() => "/dashboard/admin"),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    notFound: vi.fn(),
    redirect: vi.fn(),
  }));
}
