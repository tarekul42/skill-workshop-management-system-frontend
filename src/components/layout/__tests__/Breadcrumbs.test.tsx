import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "../Breadcrumbs";
import React from "react";
import { usePathname } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Breadcrumbs", () => {
  it("renders correctly based on pathname", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/workshops");
    render(<Breadcrumbs />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Workshops")).toBeInTheDocument();
  });

  it("returns null on the home page", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const { container } = render(<Breadcrumbs />);
    expect(container.firstChild).toBeNull();
  });

  it("handles hyphens in path segments", () => {
    vi.mocked(usePathname).mockReturnValue("/student/enrolled-workshops");
    render(<Breadcrumbs />);
    expect(screen.getByText("Enrolled Workshops")).toBeInTheDocument();
  });
});
