import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";
import React from "react";

describe("PageHeader", () => {
  it("renders title correctly", () => {
    render(<PageHeader title="User Management" />);
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Title" description="Manage all users here" />);
    expect(screen.getByText("Manage all users here")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader title="Title">
        <button>Add User</button>
      </PageHeader>,
    );
    expect(screen.getByText("Add User")).toBeInTheDocument();
  });
  it("applies display font classes to title", () => {
    render(<PageHeader title="Title" />);
    const title = screen.getByText("Title");
    expect(title).toHaveClass("font-display");
  });
});
