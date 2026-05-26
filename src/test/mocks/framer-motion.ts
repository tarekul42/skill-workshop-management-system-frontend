import React from "react";
import { vi } from "vitest";

/**
 * Mock framer-motion / motion/react for component tests.
 * This prevents animation-related errors in jsdom.
 *
 * Note: This project uses `import { motion } from "motion/react"` (v12).
 * If your component imports from "framer-motion", adjust the mock path.
 */
export function mockFramerMotion() {
  vi.mock("motion/react", () => ({
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          // motion.div, motion.span, motion.section, etc.
          const MotionComponent = React.forwardRef(
            ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref) =>
              React.createElement(prop, { ...props, ref }, children)
          );
          MotionComponent.displayName = `motion.${prop}`;
          return MotionComponent;
        },
      }
    ),
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    useInView: vi.fn(() => true),
    useMotionValue: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    useTransform: vi.fn((_value, fn) => fn(42)),
    useSpring: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
    useScroll: vi.fn(() => ({ scrollY: { get: vi.fn() } })),
  }));
}
