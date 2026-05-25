import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../step-indicator";

describe("StepIndicator", () => {
  // ── Step labels ──────────────────────────────────────────────────
  it("renders all step labels", () => {
    render(<StepIndicator currentStep={1} />);
    expect(screen.getByText("Account Details")).toBeInTheDocument();
    expect(screen.getByText("Verify Email")).toBeInTheDocument();
    expect(screen.getByText("You're In!")).toBeInTheDocument();
  });

  // ── currentStep=1 ────────────────────────────────────────────────
  describe("when currentStep=1", () => {
    it("step 1 has active (primary) background", () => {
      const { container } = render(<StepIndicator currentStep={1} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      // First step circle should have bg-primary
      expect(stepCircles[0]).toHaveClass("bg-primary");
    });

    it("step 1 shows its number (1)", () => {
      render(<StepIndicator currentStep={1} />);
      // Step 1 is active so it shows the number
      const stepCircles = document.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[0]?.textContent).toContain("1");
    });

    it("steps 2 and 3 have upcoming (surface-3) background", () => {
      const { container } = render(<StepIndicator currentStep={1} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[1]).toHaveClass("bg-surface-3");
      expect(stepCircles[2]).toHaveClass("bg-surface-3");
    });

    it("no checkmark icons are shown when step 1 is active", () => {
      const { container } = render(<StepIndicator currentStep={1} />);
      // Check icon from lucide renders as SVG — no completed steps
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      // Step 1 is active (not completed), steps 2-3 are upcoming
      // None should have bg-success
      expect(stepCircles[0]).not.toHaveClass("bg-success");
      expect(stepCircles[1]).not.toHaveClass("bg-success");
      expect(stepCircles[2]).not.toHaveClass("bg-success");
    });
  });

  // ── currentStep=2 ────────────────────────────────────────────────
  describe("when currentStep=2", () => {
    it("step 1 has completed (success) background", () => {
      const { container } = render(<StepIndicator currentStep={2} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[0]).toHaveClass("bg-success");
    });

    it("step 2 has active (primary) background", () => {
      const { container } = render(<StepIndicator currentStep={2} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[1]).toHaveClass("bg-primary");
    });

    it("step 3 has upcoming (surface-3) background", () => {
      const { container } = render(<StepIndicator currentStep={2} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[2]).toHaveClass("bg-surface-3");
    });

    it("step 1 renders a checkmark icon (completed)", () => {
      const { container } = render(<StepIndicator currentStep={2} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      // Completed step has an SVG (Check icon)
      expect(stepCircles[0]?.querySelector("svg")).toBeInTheDocument();
    });

    it("step 2 shows its number (2)", () => {
      const { container } = render(<StepIndicator currentStep={2} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[1]?.textContent).toContain("2");
    });
  });

  // ── currentStep=3 ────────────────────────────────────────────────
  describe("when currentStep=3", () => {
    it("steps 1 and 2 have completed (success) background", () => {
      const { container } = render(<StepIndicator currentStep={3} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[0]).toHaveClass("bg-success");
      expect(stepCircles[1]).toHaveClass("bg-success");
    });

    it("step 3 has active (primary) background", () => {
      const { container } = render(<StepIndicator currentStep={3} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[2]).toHaveClass("bg-primary");
    });

    it("steps 1 and 2 render checkmark icons (completed)", () => {
      const { container } = render(<StepIndicator currentStep={3} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[0]?.querySelector("svg")).toBeInTheDocument();
      expect(stepCircles[1]?.querySelector("svg")).toBeInTheDocument();
    });

    it("step 3 shows its number (3)", () => {
      const { container } = render(<StepIndicator currentStep={3} />);
      const stepCircles = container.querySelectorAll(
        ".rounded-full.flex.items-center",
      );
      expect(stepCircles[2]?.textContent).toContain("3");
    });
  });

  // ── Connecting lines ─────────────────────────────────────────────
  it("renders connecting lines between steps", () => {
    const { container } = render(<StepIndicator currentStep={1} />);
    // There should be 2 connecting lines (between 3 steps)
    const lines = container.querySelectorAll(".h-\\[2px\\]");
    expect(lines.length).toBe(2);
  });

  it("completed connecting lines have bg-success class", () => {
    const { container } = render(<StepIndicator currentStep={3} />);
    const lines = container.querySelectorAll(".h-\\[2px\\]");
    // Both lines should be success (steps 1 and 2 are completed)
    expect(lines[0]).toHaveClass("bg-success");
    expect(lines[1]).toHaveClass("bg-success");
  });
});
