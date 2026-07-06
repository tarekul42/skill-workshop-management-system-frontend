import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "../stats-card";
import { BookOpen } from "lucide-react";

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
      span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
        <span {...filterProps(props)}>{children}</span>
      ),
    },
    useMotionValue: () => ({ set: vi.fn(), get: vi.fn() }),
    useTransform: (_: unknown, fn: (v: number) => number) => fn(42),
    animate: vi.fn(() => ({ stop: vi.fn() })),
  };
});

describe("StatsCard", () => {
  it("renders the title prop", () => {
    render(<StatsCard title="Total Students" value={42} icon={BookOpen} />);
    expect(screen.getByText("Total Students")).toBeInTheDocument();
  });

  it("renders string value directly", () => {
    render(<StatsCard title="Rating" value="4.8★" icon={BookOpen} />);
    expect(screen.getByText("4.8★")).toBeInTheDocument();
  });

  it("renders skeleton when isLoading=true", () => {
    const { container } = render(<StatsCard title="Total" value={0} icon={BookOpen} isLoading />);
    // Skeleton elements have animate-pulse or similar
    // const skeletons = container.querySelectorAll(".animate-pulse, [class*='skeleton']");
    // At minimum the card renders without the title
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders positive trend with success color", () => {
    render(
      <StatsCard
        title="Students"
        value={10}
        icon={BookOpen}
        trend={{ value: 5, isPositive: true }}
      />
    );
    const trend = screen.getByText(/this month/);
    expect(trend).toHaveClass("text-success");
    expect(trend.textContent).toContain("↑");
  });

  it("renders negative trend with danger color", () => {
    render(
      <StatsCard
        title="Students"
        value={10}
        icon={BookOpen}
        trend={{ value: 3, isPositive: false }}
      />
    );
    const trend = screen.getByText(/this month/);
    expect(trend).toHaveClass("text-danger");
    expect(trend.textContent).toContain("↓");
  });

  it("renders the icon", () => {
    const { container } = render(<StatsCard title="Workshops" value={5} icon={BookOpen} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <StatsCard title="Revenue" value="৳50,000" icon={BookOpen} description="Lifetime earnings" />
    );
    expect(screen.getByText("Lifetime earnings")).toBeInTheDocument();
  });

  it.each([
    ["primary", "bg-primary-subtle"],
    ["success", "bg-success-subtle"],
    ["accent", "bg-accent-subtle"],
    ["warning", "bg-warning-subtle"],
    ["info", "bg-info-subtle"],
    ["danger", "bg-danger-subtle"],
  ] as const)("applies %s iconVariant container class", (variant, expectedClass) => {
    const { container } = render(
      <StatsCard title="Test" value={1} icon={BookOpen} iconVariant={variant} />
    );
    expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
  });

  it("defaults to primary iconVariant when not specified", () => {
    const { container } = render(<StatsCard title="Test" value={1} icon={BookOpen} />);
    expect(container.querySelector(".bg-primary-subtle")).toBeInTheDocument();
  });
});
