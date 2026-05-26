import { describe, it, expect } from "vitest";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  scaleIn,
  slideInRight,
  modalVariants,
  toastVariants,
  countUpSpring,
} from "@/lib/motion-variants";

describe("motion-variants", () => {
  describe("fadeInUp", () => {
    it("should have initial state with opacity 0 and positive y offset", () => {
      expect(fadeInUp.initial).toHaveProperty("opacity", 0);
      expect(fadeInUp.initial).toHaveProperty("y");
      expect((fadeInUp.initial as { y: number }).y).toBeGreaterThan(0);
    });

    it("should have animate state with opacity 1 and y 0", () => {
      expect(fadeInUp.animate).toHaveProperty("opacity", 1);
      expect(fadeInUp.animate).toHaveProperty("y", 0);
    });

    it("should have exit state with opacity 0", () => {
      expect(fadeInUp.exit).toHaveProperty("opacity", 0);
    });

    it("should have transition configuration in animate", () => {
      const animate = fadeInUp.animate as { transition?: { duration?: number } };
      expect(animate.transition).toBeDefined();
      expect(animate.transition?.duration).toBeLessThanOrEqual(0.6);
    });
  });

  describe("staggerContainer", () => {
    it("should have animate state with staggerChildren", () => {
      const animate = staggerContainer.animate as { transition?: { staggerChildren?: number } };
      expect(animate.transition).toHaveProperty("staggerChildren");
      expect(animate.transition?.staggerChildren).toBeGreaterThan(0);
      expect(animate.transition?.staggerChildren).toBeLessThanOrEqual(0.15);
    });

    it("should have delayChildren in animate transition", () => {
      const animate = staggerContainer.animate as { transition?: { delayChildren?: number } };
      expect(animate.transition).toBeDefined();
      expect(animate.transition?.delayChildren).toBeGreaterThan(0);
    });
  });

  describe("staggerItem", () => {
    it("should have initial state with opacity 0 and positive y offset", () => {
      expect(staggerItem.initial).toHaveProperty("opacity", 0);
      expect((staggerItem.initial as { y: number }).y).toBeGreaterThan(0);
    });

    it("should have animate state with opacity 1 and y 0", () => {
      expect(staggerItem.animate).toHaveProperty("opacity", 1);
      expect(staggerItem.animate).toHaveProperty("y", 0);
    });
  });

  describe("scaleIn", () => {
    it("should have initial state with scale less than 1 and opacity 0", () => {
      const initial = scaleIn.initial as { scale?: number; opacity?: number };
      expect(initial).toHaveProperty("scale");
      expect(initial.scale).toBeLessThan(1);
      expect(initial.opacity).toBe(0);
    });

    it("should have animate state with scale 1 and opacity 1", () => {
      const animate = scaleIn.animate as { scale?: number; opacity?: number };
      expect(animate).toHaveProperty("scale", 1);
      expect(animate.opacity).toBe(1);
    });

    it("should have reasonable transition duration", () => {
      const animate = scaleIn.animate as { transition?: { duration?: number } };
      expect(animate.transition?.duration).toBeLessThanOrEqual(0.5);
    });
  });

  describe("slideInRight", () => {
    it("should have initial state with positive x offset and opacity 0", () => {
      const initial = slideInRight.initial as { x?: number; opacity?: number };
      expect(initial).toHaveProperty("x");
      expect(initial.x).toBeGreaterThan(0);
      expect(initial.opacity).toBe(0);
    });

    it("should have animate state with x 0 and opacity 1", () => {
      const animate = slideInRight.animate as { x?: number; opacity?: number };
      expect(animate).toHaveProperty("x", 0);
      expect(animate.opacity).toBe(1);
    });
  });

  describe("modalVariants", () => {
    it("should have initial state with opacity 0 and scale less than 1", () => {
      const initial = modalVariants.initial as { opacity?: number; scale?: number };
      expect(initial.opacity).toBe(0);
      expect(initial.scale).toBeLessThan(1);
    });

    it("should have animate state with opacity 1, scale 1, and y 0", () => {
      const animate = modalVariants.animate as { opacity?: number; scale?: number; y?: number };
      expect(animate.opacity).toBe(1);
      expect(animate.scale).toBe(1);
      expect(animate.y).toBe(0);
    });

    it("should have exit state with opacity 0", () => {
      const exit = modalVariants.exit as { opacity?: number };
      expect(exit.opacity).toBe(0);
    });
  });

  describe("toastVariants", () => {
    it("should have initial state with opacity 0 and negative y offset", () => {
      const initial = toastVariants.initial as { opacity?: number; y?: number };
      expect(initial.opacity).toBe(0);
      expect(initial.y).toBeLessThan(0);
    });

    it("should have animate state with opacity 1, y 0, and scale 1", () => {
      const animate = toastVariants.animate as { opacity?: number; y?: number; scale?: number };
      expect(animate.opacity).toBe(1);
      expect(animate.y).toBe(0);
      expect(animate.scale).toBe(1);
    });

    it("should have exit state with opacity 0", () => {
      const exit = toastVariants.exit as { opacity?: number };
      expect(exit.opacity).toBe(0);
    });
  });

  describe("countUpSpring", () => {
    it("should have stiffness property", () => {
      expect(countUpSpring).toHaveProperty("stiffness");
      expect(countUpSpring.stiffness).toBeGreaterThan(0);
    });

    it("should have damping property", () => {
      expect(countUpSpring).toHaveProperty("damping");
      expect(countUpSpring.damping).toBeGreaterThan(0);
    });

    it("should have duration property", () => {
      expect(countUpSpring).toHaveProperty("duration");
      expect(countUpSpring.duration).toBeGreaterThan(0);
    });
  });
});
