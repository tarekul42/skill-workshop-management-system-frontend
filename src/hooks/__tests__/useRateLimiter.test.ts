import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRateLimiter } from "../useRateLimiter";

describe("useRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("starts unlocked with 0 remaining", () => {
    const { result } = renderHook(() => useRateLimiter());
    expect(result.current.remaining).toBe(0);
    expect(result.current.isLocked).toBe(false);
  });

  it("locks for baseDelay seconds after first attempt", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 4_000 }));
    act(() => {
      result.current.recordAttempt();
    });
    expect(result.current.isLocked).toBe(true);
    expect(result.current.remaining).toBe(4); // ceil(4000/1000)
  });

  it("counts down to 0 and unlocks", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 3_000 }));
    act(() => {
      result.current.recordAttempt();
    });
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isLocked).toBe(false);
  });

  it("doubles cooldown on second attempt (exponential backoff)", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 5_000 }));
    act(() => {
      result.current.recordAttempt();
    });
    expect(result.current.remaining).toBe(5);

    // Advance past first cooldown
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      result.current.recordAttempt();
    });
    // 5000 * 2^(2-1) = 10000 → ceil(10000/1000) = 10
    expect(result.current.remaining).toBe(10);
  });

  it("caps cooldown at 60 seconds", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 50_000, maxAttempts: 3 }));
    // 1st: ceil(50000/1000) = 50
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(50);

    act(() => vi.advanceTimersByTime(50000));

    // 2nd: min(50000 * 2^(2-1), 60000) = min(100000, 60000) = 60000 → 60
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(60);
  });

  it("does not increase cooldown beyond maxAttempts cap", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 2_000, maxAttempts: 3 }));
    // 1st: 2
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(2);
    act(() => vi.advanceTimersByTime(2000));

    // 2nd: 4
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(4);
    act(() => vi.advanceTimersByTime(4000));

    // 3rd: 8
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(8);
    act(() => vi.advanceTimersByTime(8000));

    // 4th: capped at maxAttempts=3, so still 8 (not 16)
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(8);
  });

  it("reset() clears remaining, lock, and restarts attempt count", () => {
    const { result } = renderHook(() => useRateLimiter({ baseDelay: 5_000 }));
    act(() => result.current.recordAttempt());
    expect(result.current.isLocked).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isLocked).toBe(false);

    // After reset, first attempt should be baseDelay again (not doubled)
    act(() => result.current.recordAttempt());
    expect(result.current.remaining).toBe(5);
  });

  it("clears timer on unmount", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { result, unmount } = renderHook(() => useRateLimiter({ baseDelay: 5_000 }));
    act(() => result.current.recordAttempt());
    expect(result.current.isLocked).toBe(true);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("uses custom label in console output in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { result } = renderHook(() => useRateLimiter({ label: "login" }));
    act(() => result.current.recordAttempt());
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("[rate-limiter] login"));
    infoSpy.mockRestore();
  });

  it("uses defaults when no config provided", () => {
    const { result } = renderHook(() => useRateLimiter());
    act(() => result.current.recordAttempt());
    // baseDelay=5000 → 5s
    expect(result.current.remaining).toBe(5);

    // 6th attempt caps at maxAttempts=5
    for (let i = 0; i < 5; i++) {
      act(() => vi.advanceTimersByTime(100000));
      act(() => result.current.recordAttempt());
    }
    // After 5 attempts, progress is capped → remaining should be capped
    expect(result.current.remaining).toBeGreaterThan(0);
  });
});
