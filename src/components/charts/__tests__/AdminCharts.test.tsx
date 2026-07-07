import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PerformanceTrendChart, UserDistributionChart } from "../AdminCharts";

describe("PerformanceTrendChart", () => {
  it("renders chart when data is provided", () => {
    const data = [
      { name: "Jan", value: 100 },
      { name: "Feb", value: 200 },
    ];
    const { container } = render(<PerformanceTrendChart data={data} />);
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });

  it("shows empty state when no data", () => {
    render(<PerformanceTrendChart data={[]} />);
    expect(screen.getByText("No trend data available yet")).toBeInTheDocument();
  });
});

describe("UserDistributionChart", () => {
  it("renders chart when roles are provided", () => {
    const roles = [
      { name: "Admin", value: 5 },
      { name: "Student", value: 100 },
    ];
    const { container } = render(<UserDistributionChart roles={roles} />);
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });

  it("shows empty state when no roles", () => {
    render(<UserDistributionChart roles={[]} />);
    expect(screen.getByText("No user data")).toBeInTheDocument();
  });
});
