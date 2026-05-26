import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import React from "react";

describe("Card", () => {
  it("renders card content correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card Body Content</CardContent>
      </Card>
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Body Content")).toBeInTheDocument();
  });

  it("applies interactive classes when interactive prop is true", () => {
    render(
      <Card interactive data-testid="interactive-card">
        Interactive
      </Card>
    );
    const card = screen.getByTestId("interactive-card");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("hover:shadow-3");
  });

  it("applies small size classes", () => {
    render(
      <Card size="sm" data-testid="small-card">
        Small
      </Card>
    );
    expect(screen.getByTestId("small-card")).toHaveClass("rounded-xl");
  });
});
