"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RateLimiterConfig {
  maxAttempts?: number;
  baseDelay?: number;
  label?: string;
}

const DEFAULTS = {
  maxAttempts: 5,
  baseDelay: 5_000,
};

/**
 * Client-side rate limiter with exponential backoff.
 *
 * Complements server-side rate limiting by throttling rapid re-submissions
 * at the UI layer. Each call to `recordAttempt()` increments a counter and
 * starts a cooldown timer. The timer doubles with each attempt up to 60s.
 */
export function useRateLimiter(config: RateLimiterConfig = {}) {
  const { maxAttempts = DEFAULTS.maxAttempts, baseDelay = DEFAULTS.baseDelay, label } = config;

  const [remaining, setRemaining] = useState(0);
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLocked = remaining > 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const recordAttempt = useCallback(() => {
    attemptRef.current += 1;
    const capped = Math.min(attemptRef.current, maxAttempts);
    const delay = Math.min(baseDelay * Math.pow(2, capped - 1), 60_000);
    const seconds = Math.ceil(delay / 1000);

    if (process.env.NODE_ENV === "development") {
      console.info(
        `[rate-limiter]${label ? ` ${label}` : ""} attempt=${attemptRef.current} cooldown=${seconds}s`
      );
    }

    clearTimer();
    setRemaining(seconds);

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [maxAttempts, baseDelay, clearTimer, label]);

  const reset = useCallback(() => {
    clearTimer();
    attemptRef.current = 0;
    setRemaining(0);
  }, [clearTimer]);

  return { remaining, isLocked, recordAttempt, reset } as const;
}
