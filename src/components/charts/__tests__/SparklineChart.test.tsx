import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparklineChart } from "../SparklineChart";

describe("SparklineChart", () => {
  it("renders chart when data is provided", () => {
    const data = [{ value: 10 }, { value: 20 }, { value: 15 }];
    const { container } = render(<SparklineChart data={data} color="var(--primary)" />);
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });

  it("returns null for empty data", () => {
    const { container } = render(<SparklineChart data={[]} color="var(--primary)" />);
    expect(container.innerHTML).toBe("");
  });
});
