import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../button";
import React from "react";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-danger");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-[1.5px]");
  });

  it("shows loading spinner and hides text when loading=true", () => {
    render(<Button loading>Submit</Button>);
    // Loader2 should be present
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    // Text should be present but invisible (opacity-0)
    const text = screen.getByText("Submit");
    expect(text).toHaveClass("opacity-0");
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
