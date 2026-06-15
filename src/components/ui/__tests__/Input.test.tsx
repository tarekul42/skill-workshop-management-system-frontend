/// <reference types="vitest/globals" />
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../input";

describe("Input", () => {
  it("renders correctly with placeholder", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("handles value changes correctly", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies error styles when error prop is true", () => {
    render(<Input error data-testid="error-input" />);
    expect(screen.getByTestId("error-input")).toHaveClass("border-danger");
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
