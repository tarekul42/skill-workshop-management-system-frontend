import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../status-badge";

// Mock framer-motion
vi.mock("framer-motion", () => {
  const filterProps = (allProps: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initial, animate, exit, transition, whileHover, whileTap, ...props } = allProps;
    return props;
  };
  return {
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...filterProps(props)}>{children}</div>
      ),
      span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
        <span {...filterProps(props)}>{children}</span>
      ),
      button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...filterProps(props)}>{children}</button>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("StatusBadge", () => {
  // ── Warning set ──────────────────────────────────────────────────
  it("renders PENDING with warning variant", () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    expect(container.firstChild).toHaveClass("bg-warning-subtle");
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("renders PENDING_PAYMENT with warning variant", () => {
    const { container } = render(<StatusBadge status="PENDING_PAYMENT" />);
    expect(container.firstChild).toHaveClass("bg-warning-subtle");
  });

  // ── Success set ──────────────────────────────────────────────────
  it.each(["COMPLETE", "PAID", "ACTIVE", "PUBLISHED"])(
    "renders %s with success variant",
    (status) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.firstChild).toHaveClass("bg-success-subtle");
    }
  );

  it("renders COMPLETED with success variant", () => {
    const { container } = render(<StatusBadge status="COMPLETED" />);
    expect(container.firstChild).toHaveClass("bg-success-subtle");
  });

  // ── Danger set ───────────────────────────────────────────────────
  it.each(["CANCEL", "CANCELLED", "FAILED", "BLOCKED"])(
    "renders %s with danger variant",
    (status) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.firstChild).toHaveClass("bg-danger-subtle");
    }
  );

  // ── Muted set ────────────────────────────────────────────────────
  it.each(["DRAFT", "UNPAID"])("renders %s with muted variant", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.firstChild).toHaveClass("bg-surface-3");
  });

  // ── Info set ─────────────────────────────────────────────────────
  it.each(["REFUNDED", "PROCESSING"])("renders %s with info variant", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.firstChild).toHaveClass("bg-info-subtle");
  });

  // ── Default/secondary ────────────────────────────────────────────
  it("renders unknown status with secondary (default) variant", () => {
    const { container } = render(<StatusBadge status="UNKNOWN_STATUS" />);
    // secondary variant — should not have any of the semantic bg classes
    expect(container.firstChild).not.toHaveClass("bg-warning-subtle");
    expect(container.firstChild).not.toHaveClass("bg-success-subtle");
    expect(container.firstChild).not.toHaveClass("bg-danger-subtle");
    expect(container.firstChild).not.toHaveClass("bg-info-subtle");
  });

  // ── Dot variant ──────────────────────────────────────────────────
  it("renders a dot element when dot={true}", () => {
    const { container } = render(<StatusBadge status="PENDING" dot />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("rounded-full");
  });

  it("does not render a dot element when dot is not set", () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  // ── Underscore replacement ───────────────────────────────────────
  it("replaces underscores with spaces in displayed text", () => {
    render(<StatusBadge status="PENDING_PAYMENT" />);
    expect(screen.getByText("PENDING PAYMENT")).toBeInTheDocument();
  });

  it("replaces multiple underscores with spaces", () => {
    render(<StatusBadge status="SOME_CUSTOM_STATUS" />);
    expect(screen.getByText("SOME CUSTOM STATUS")).toBeInTheDocument();
  });

  it("displays status text without underscores for single-word statuses", () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  // ── Case insensitivity ───────────────────────────────────────────
  it("handles lowercase status strings correctly", () => {
    const { container } = render(<StatusBadge status="pending" />);
    expect(container.firstChild).toHaveClass("bg-warning-subtle");
  });

  it("handles mixed-case status strings correctly", () => {
    const { container } = render(<StatusBadge status="Complete" />);
    expect(container.firstChild).toHaveClass("bg-success-subtle");
  });
});
