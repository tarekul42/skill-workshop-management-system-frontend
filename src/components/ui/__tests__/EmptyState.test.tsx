import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../empty-state";
import { BookOpen } from "lucide-react";

// Mock framer-motion
vi.mock("framer-motion", () => {
  const filterProps = (allProps: Record<string, unknown>) => {
    const filtered = { ...allProps };
    for (const key of ["initial", "animate", "exit", "transition", "whileHover", "whileTap"]) {
      delete filtered[key];
    }
    return filtered;
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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

describe("EmptyState", () => {
  // ── Title ────────────────────────────────────────────────────────
  it("renders the title prop", () => {
    render(<EmptyState title="No workshops found" />);
    expect(screen.getByText("No workshops found")).toBeInTheDocument();
  });

  // ── Description ──────────────────────────────────────────────────
  it("renders the description when provided", () => {
    render(<EmptyState title="Empty" description="Try adjusting your filters" />);
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    // No paragraph with description text
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });

  // ── Action button ────────────────────────────────────────────────
  it("renders action button when action prop is provided", () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: "Browse Workshops", onClick }} />);
    expect(screen.getByText("Browse Workshops")).toBeInTheDocument();
  });

  it("calls action.onClick when action button is clicked", () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: "Browse Workshops", onClick }} />);
    fireEvent.click(screen.getByText("Browse Workshops"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── Secondary action ─────────────────────────────────────────────
  it("renders secondary action button when secondaryAction prop is provided", () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" secondaryAction={{ label: "Clear Filters", onClick }} />);
    expect(screen.getByText("Clear Filters")).toBeInTheDocument();
  });

  it("calls secondaryAction.onClick when secondary button is clicked", () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" secondaryAction={{ label: "Clear Filters", onClick }} />);
    fireEvent.click(screen.getByText("Clear Filters"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── No buttons when not provided ─────────────────────────────────
  it("renders no action buttons when neither action nor secondaryAction is provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // ── Custom icon ──────────────────────────────────────────────────
  it("renders custom icon when icon prop is provided", () => {
    const { container } = render(<EmptyState title="Empty" icon={BookOpen} />);
    // SVG should be present from the icon
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  // ── Variants render different icons ──────────────────────────────
  it.each(["workshops", "enrollments", "payments", "users", "calendar", "default"] as const)(
    "renders an icon for variant '%s'",
    (variant) => {
      const { container } = render(<EmptyState title="Empty" variant={variant} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    }
  );

  it("renders different SVG paths for different variants", () => {
    const { container: c1 } = render(<EmptyState title="Empty" variant="workshops" />);
    const { container: c2 } = render(<EmptyState title="Empty" variant="users" />);
    // Both have SVGs but they should be different icons
    const svg1 = c1.querySelector("svg");
    const svg2 = c2.querySelector("svg");
    expect(svg1).toBeInTheDocument();
    expect(svg2).toBeInTheDocument();
    // The path data should differ between different icons
    expect(svg1?.innerHTML).not.toBe(svg2?.innerHTML);
  });
});
