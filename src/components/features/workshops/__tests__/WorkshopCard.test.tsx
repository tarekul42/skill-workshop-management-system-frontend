import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkshopCard from "../WorkshopCard";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => React.createElement("img", props),
}));

vi.mock("@/lib/formatters", () => ({
  formatCurrency: (v: number) => `$${v}`,
  formatDate: (d: string) => new Date(d).toLocaleDateString(),
  computeDuration: () => "3 days",
}));

vi.mock("@/lib/api/services", () => ({
  getLevelName: (level: string | { name: string }) =>
    typeof level === "string" ? level : level.name,
  getCategoryName: (cat: string | { name: string }) => (typeof cat === "string" ? cat : cat.name),
}));

const baseWorkshop = {
  _id: "w1",
  title: "Advanced React Workshop",
  slug: "advanced-react",
  description: "Learn advanced React patterns and performance optimization.",
  images: ["https://example.com/react.jpg"],
  price: 299,
  currentEnrollments: 15,
  maxSeats: 20,
  location: "Dhaka, Bangladesh",
  startDate: "2026-08-15T00:00:00Z",
  endDate: "2026-08-17T00:00:00Z",
  level: "Advanced",
  category: "Programming",
  whatYouLearn: [],
  prerequisites: [],
  benefits: [],
  syllabus: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("WorkshopCard", () => {
  it("renders workshop title and slug link", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    const link = screen.getByText("Advanced React Workshop").closest("a");
    expect(link).toHaveAttribute("href", "/workshops/advanced-react");
  });

  it("renders price formatted", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("$299")).toBeInTheDocument();
  });

  it("renders level badge", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("renders category name", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("Programming")).toBeInTheDocument();
  });

  it("renders location", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("Dhaka, Bangladesh")).toBeInTheDocument();
  });

  it("renders start date", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("8/15/2026")).toBeInTheDocument();
  });

  it("renders duration from computeDuration", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("3 days")).toBeInTheDocument();
  });

  it("renders seats left count", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("5 seats left")).toBeInTheDocument();
  });

  it('shows "∞ seats left" when maxSeats is not set', () => {
    render(<WorkshopCard workshop={{ ...baseWorkshop, maxSeats: undefined }} />);
    expect(screen.getByText("∞ seats left")).toBeInTheDocument();
  });

  it("shows description when showDescription is true", () => {
    render(<WorkshopCard workshop={baseWorkshop} showDescription />);
    expect(
      screen.getByText("Learn advanced React patterns and performance optimization.")
    ).toBeInTheDocument();
  });

  it("hides description when showDescription is false", () => {
    render(<WorkshopCard workshop={baseWorkshop} showDescription={false} />);
    expect(
      screen.queryByText("Learn advanced React patterns and performance optimization.")
    ).not.toBeInTheDocument();
  });

  it("renders BookOpen fallback when no images", () => {
    const { container } = render(<WorkshopCard workshop={{ ...baseWorkshop, images: [] }} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders workshop image when images exist", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    const img = screen.getByAltText("Advanced React Workshop");
    expect(img).toHaveAttribute("src", "https://example.com/react.jpg");
  });

  it("renders Enroll Now link", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    const enroll = screen.getByText("Enroll Now →");
    expect(enroll.closest("a")).toHaveAttribute("href", "/workshops/advanced-react");
  });

  it("uses success bar color when < 50% enrolled", () => {
    const { container } = render(
      <WorkshopCard workshop={{ ...baseWorkshop, currentEnrollments: 5, maxSeats: 20 }} />
    );
    const allBars = container.querySelectorAll('[class*="rounded-full"]');
    const progressBar = Array.from(allBars).find(
      (el) =>
        el.classList.contains("bg-success") ||
        el.classList.contains("bg-warning") ||
        el.classList.contains("bg-danger")
    );
    expect(progressBar).toHaveClass("bg-success");
  });

  it("uses warning bar color when 50-75% enrolled", () => {
    const { container } = render(
      <WorkshopCard workshop={{ ...baseWorkshop, currentEnrollments: 13, maxSeats: 20 }} />
    );
    const allBars = container.querySelectorAll('[class*="rounded-full"]');
    const progressBar = Array.from(allBars).find(
      (el) =>
        el.classList.contains("bg-success") ||
        el.classList.contains("bg-warning") ||
        el.classList.contains("bg-danger")
    );
    expect(progressBar).toHaveClass("bg-warning");
  });

  it("uses danger bar color when > 75% enrolled", () => {
    const { container } = render(
      <WorkshopCard workshop={{ ...baseWorkshop, currentEnrollments: 18, maxSeats: 20 }} />
    );
    const allBars = container.querySelectorAll('[class*="rounded-full"]');
    const progressBar = Array.from(allBars).find(
      (el) =>
        el.classList.contains("bg-success") ||
        el.classList.contains("bg-warning") ||
        el.classList.contains("bg-danger")
    );
    expect(progressBar).toHaveClass("bg-danger");
  });

  it("handles string level and object level", () => {
    const { rerender } = render(
      <WorkshopCard workshop={{ ...baseWorkshop, level: { _id: "l1", name: "Beginner" } }} />
    );
    expect(screen.getByText("Beginner")).toBeInTheDocument();

    rerender(<WorkshopCard workshop={{ ...baseWorkshop, level: "Intermediate" }} />);
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("handles string category and object category", () => {
    const { rerender } = render(
      <WorkshopCard
        workshop={{ ...baseWorkshop, category: { _id: "c1", name: "Web Dev", slug: "web-dev" } }}
      />
    );
    expect(screen.getByText("Web Dev")).toBeInTheDocument();

    rerender(<WorkshopCard workshop={{ ...baseWorkshop, category: "Backend" }} />);
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("assigns default variant for unknown level", () => {
    render(<WorkshopCard workshop={{ ...baseWorkshop, level: "UnknownLevel" }} />);
    expect(screen.getByText("UnknownLevel")).toBeInTheDocument();
  });
});
