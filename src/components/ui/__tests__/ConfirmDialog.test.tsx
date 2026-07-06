import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "../confirm-dialog";

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

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Delete Workshop",
  description: "This action cannot be undone.",
  onConfirm: vi.fn(),
};

describe("ConfirmDialog", () => {
  // ── Rendering ────────────────────────────────────────────────────
  it("renders title and description when open=true", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete Workshop")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("does not render content when open=false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Delete Workshop")).not.toBeInTheDocument();
  });

  // ── Cancel button ────────────────────────────────────────────────
  it("calls onOpenChange(false) when cancel button is clicked", () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders custom cancelLabel", () => {
    render(<ConfirmDialog {...defaultProps} cancelLabel="Go Back" />);
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  // ── Confirm button ───────────────────────────────────────────────
  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders custom confirmLabel", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Yes, Delete" />);
    expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
  });

  // ── Loading state ────────────────────────────────────────────────
  it("shows loading spinner when isLoading=true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("disables confirm button when isLoading=true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    const confirmBtn = screen.getByText("Confirm").closest("button");
    expect(confirmBtn).toBeDisabled();
  });

  it("disables cancel button when isLoading=true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    const cancelBtn = screen.getByText("Cancel").closest("button");
    expect(cancelBtn).toBeDisabled();
  });

  // ── Icon variants ────────────────────────────────────────────────
  it("renders icon container for destructive variant", () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".bg-danger-subtle")).toBeInTheDocument();
  });

  it("renders icon container for default variant", () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".bg-warning-subtle")).toBeInTheDocument();
  });

  // ── requireConfirmText ───────────────────────────────────────────
  it("renders confirmation input when requireConfirmText is provided", () => {
    render(<ConfirmDialog {...defaultProps} requireConfirmText="DELETE" />);
    expect(screen.getByPlaceholderText("Type exactly 'DELETE'")).toBeInTheDocument();
  });

  it("disables confirm button when input does not match requireConfirmText", () => {
    render(<ConfirmDialog {...defaultProps} requireConfirmText="DELETE" />);
    const input = screen.getByPlaceholderText("Type exactly 'DELETE'");
    fireEvent.change(input, { target: { value: "DELET" } });
    const confirmBtn = screen.getByText("Confirm").closest("button");
    expect(confirmBtn).toBeDisabled();
  });

  it("enables confirm button when input exactly matches requireConfirmText", () => {
    render(<ConfirmDialog {...defaultProps} requireConfirmText="DELETE" />);
    const input = screen.getByPlaceholderText("Type exactly 'DELETE'");
    fireEvent.change(input, { target: { value: "DELETE" } });
    const confirmBtn = screen.getByText("Confirm").closest("button");
    expect(confirmBtn).not.toBeDisabled();
  });

  it("shows the requireConfirmText value in the instruction text", () => {
    render(<ConfirmDialog {...defaultProps} requireConfirmText="CONFIRM" />);
    expect(screen.getByPlaceholderText("Type exactly 'CONFIRM'")).toBeInTheDocument();
  });

  it("does not render confirmation input when requireConfirmText is not provided", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // ── Typography ───────────────────────────────────────────────────
  it("applies font-display class to title", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const title = screen.getByText("Delete Workshop");
    expect(title).toHaveClass("font-display");
  });
});
