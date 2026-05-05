import type { Variants } from "framer-motion";

/** §1.5 — Framer Motion reusable variants (define once, import everywhere) */

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

/** Used as child of staggerContainer — inherits stagger timing */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] },
  },
};

export const toastVariants: Variants = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] },
  },
};

/**
 * §1.5 — countUp spring configuration.
 * Use with `useSpring` from framer-motion:
 *   const x = useSpring(0, countUpSpring);
 *   useEffect(() => { x.set(targetValue); }, []);
 */
export const countUpSpring = {
  stiffness: 80,
  damping: 20,
  duration: 1.2,
};
