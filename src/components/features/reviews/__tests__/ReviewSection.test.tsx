import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ReviewSection } from "../ReviewSection";
import { createTestQueryClient, TestQueryWrapper } from "@/test/mocks/tanstack-query";

const { mockGetWorkshopReviews, mockGetWorkshopReviewStats, mockDeleteReview, mockGetSavedUser } =
  vi.hoisted(() => ({
    mockGetWorkshopReviews: vi.fn(),
    mockGetWorkshopReviewStats: vi.fn(),
    mockDeleteReview: vi.fn(),
    mockGetSavedUser: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/lib/api/services", () => ({
  getWorkshopReviews: (...args: unknown[]) => mockGetWorkshopReviews(...args),
  getWorkshopReviewStats: (...args: unknown[]) => mockGetWorkshopReviewStats(...args),
  deleteReview: (...args: unknown[]) => mockDeleteReview(...args),
}));

vi.mock("@/lib/auth-helpers", () => ({
  getSavedUser: (...args: unknown[]) => mockGetSavedUser(...args),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

interface WithChildren {
  children?: React.ReactNode;
}
interface SelectCls extends WithChildren {
  value?: string;
  onValueChange?: (v: string) => void;
}
interface DialogCls extends WithChildren {
  open?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}
interface ButtonCls extends WithChildren {
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  className?: string;
  [key: string]: unknown;
}
interface ItemCls extends WithChildren {
  value?: string;
}
interface FormCls {
  workshopId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: WithChildren) =>
    React.createElement("div", { "data-testid": "avatar" }, children),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) =>
    React.createElement("img", { src, alt, "data-testid": "avatar-image" }),
  AvatarFallback: ({ children }: WithChildren) =>
    React.createElement("span", { "data-testid": "avatar-fallback" }, children),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: SelectCls) =>
    React.createElement(
      "div",
      { "data-testid": "select", "data-value": value },
      React.createElement(
        "select",
        {
          value,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValueChange?.(e.target.value),
          "aria-label": "Sort by",
        },
        React.createElement("option", { value: "newest" }, "Newest First"),
        React.createElement("option", { value: "oldest" }, "Oldest First"),
        React.createElement("option", { value: "highest" }, "Highest Rated"),
        React.createElement("option", { value: "lowest" }, "Lowest Rated")
      ),
      children
    ),
  SelectTrigger: ({ children }: WithChildren) => React.createElement("div", null, children),
  SelectValue: () => null,
  SelectContent: ({ children }: WithChildren) => React.createElement("div", null, children),
  SelectItem: ({ children, value }: ItemCls) => React.createElement("option", { value }, children),
}));

vi.mock("@/components/ui/confirm-dialog", () => ({
  ConfirmDialog: ({ open, title, description, confirmLabel, onConfirm, isLoading }: DialogCls) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "confirm-dialog" },
          React.createElement("h3", null, title),
          React.createElement("p", null, description),
          React.createElement("button", { onClick: onConfirm, disabled: isLoading }, confirmLabel)
        )
      : null,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: ButtonCls) =>
    React.createElement(
      "button",
      { onClick, disabled, className, "data-variant": variant, ...props },
      children,
    ),
}));

vi.mock("../ReviewForm", () => ({
  ReviewForm: ({ workshopId, onSuccess, onCancel }: FormCls) =>
    React.createElement(
      "div",
      { "data-testid": "review-form" },
      React.createElement("span", null, `ReviewForm for ${workshopId}`),
      React.createElement("button", { onClick: onSuccess }, "Submit Success"),
      React.createElement("button", { onClick: onCancel }, "Cancel")
    ),
}));

const mockReviews = [
  {
    _id: "review-1",
    user: { _id: "user-1", name: "Alice", picture: "" },
    workshop: "ws-1",
    rating: 5,
    title: "Amazing!",
    content: "Really enjoyed this workshop, learned a lot.",
    status: "APPROVED",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    _id: "review-2",
    user: { _id: "user-2", name: "Bob", picture: "https://example.com/pic.jpg" },
    workshop: "ws-1",
    rating: 3,
    title: "Decent",
    content: "It was okay, could be better.",
    status: "APPROVED",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
];

const mockStats = {
  averageRating: 4,
  totalReviews: 2,
  distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
};

function renderSection(workshopId = "ws-1") {
  const queryClient = createTestQueryClient();
  return render(
    <TestQueryWrapper client={queryClient}>
      <ReviewSection workshopId={workshopId} />
    </TestQueryWrapper>
  );
}

describe("ReviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSavedUser.mockReturnValue(null);
    mockGetWorkshopReviews.mockResolvedValue({
      data: mockReviews,
      meta: { page: 1, limit: 5, total: 2, totalPage: 1 },
    });
    mockGetWorkshopReviewStats.mockResolvedValue(mockStats);
    mockDeleteReview.mockResolvedValue(undefined);
  });

  describe("Loading state", () => {
    it("shows section heading while fetching", () => {
      mockGetWorkshopReviews.mockImplementation(() => new Promise(() => {}));
      mockGetWorkshopReviewStats.mockImplementation(() => new Promise(() => {}));
      renderSection();
      expect(screen.getByText("Student Reviews")).toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("shows error alert when reviews fail to load", async () => {
      mockGetWorkshopReviews.mockRejectedValue(new Error("Network error"));
      renderSection();
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
      expect(screen.getByText(/Failed to load reviews/)).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("shows empty reviews message in the main list", async () => {
      mockGetWorkshopReviews.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 5, total: 0, totalPage: 0 },
      });
      mockGetWorkshopReviewStats.mockResolvedValue({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      renderSection();
      await waitFor(() => {
        const headings = screen.getAllByText("No reviews yet");
        expect(headings.length).toBe(2);
      });
    });
  });

  describe("With reviews", () => {
    it("renders review cards with correct data", async () => {
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Amazing!")).toBeInTheDocument();
        expect(screen.getByText("Decent")).toBeInTheDocument();
      });
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText(/Really enjoyed/)).toBeInTheDocument();
    });

    it("shows edit/delete buttons for own reviews", async () => {
      mockGetSavedUser.mockReturnValue({ _id: "user-1", name: "Alice", role: "STUDENT" });
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Amazing!")).toBeInTheDocument();
      });
      const editButtons = screen.getAllByLabelText("Edit review");
      const deleteButtons = screen.getAllByLabelText("Delete review");
      expect(editButtons).toHaveLength(1);
      expect(deleteButtons).toHaveLength(1);
    });

    it("shows average rating and distribution", async () => {
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("4.0")).toBeInTheDocument();
      });
      expect(screen.getByText(/Based on 2 reviews/)).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("calls getWorkshopReviews with new sort when changed", async () => {
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Amazing!")).toBeInTheDocument();
      });
      mockGetWorkshopReviews.mockClear();
      mockGetWorkshopReviews.mockResolvedValue({
        data: [...mockReviews].reverse(),
        meta: { page: 1, limit: 5, total: 2, totalPage: 1 },
      });

      const select = screen.getByLabelText("Sort by");
      fireEvent.change(select, { target: { value: "oldest" } });
      await waitFor(() => {
        expect(mockGetWorkshopReviews).toHaveBeenCalledWith(
          "ws-1",
          expect.objectContaining({ sort: "oldest" })
        );
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination when there are multiple pages", async () => {
      const manyReviews = Array.from({ length: 7 }, (_, i) => ({
        _id: `review-${i}`,
        user: { _id: `user-${i}`, name: `User ${i}`, picture: "" },
        workshop: "ws-1",
        rating: 4,
        title: `Review ${i}`,
        content: "Great workshop! ".repeat(3),
        status: "APPROVED",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      }));
      mockGetWorkshopReviews.mockResolvedValue({
        data: manyReviews.slice(0, 5),
        meta: { page: 1, limit: 5, total: 7, totalPage: 2 },
      });
      renderSection();
      await waitFor(() => {
        expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      });
    });
  });

  describe("Delete confirmation", () => {
    it("opens confirmation dialog and deletes review", async () => {
      mockGetSavedUser.mockReturnValue({ _id: "user-1", name: "Alice", role: "STUDENT" });
      mockGetWorkshopReviews.mockResolvedValue({
        data: [mockReviews[0]],
        meta: { page: 1, limit: 5, total: 1, totalPage: 1 },
      });
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Amazing!")).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText("Delete review");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });
      expect(screen.getByText("Delete Review")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Delete"));

      await waitFor(() => {
        expect(mockDeleteReview).toHaveBeenCalledWith("review-1");
      });
    });
  });

  describe("Write review button", () => {
    it("shows write button for logged-in user", async () => {
      mockGetSavedUser.mockReturnValue({ _id: "user-1", name: "Alice", role: "STUDENT" });
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Write a Review")).toBeInTheDocument();
      });
    });

    it("hides write button when not logged in", async () => {
      mockGetSavedUser.mockReturnValue(null);
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Amazing!")).toBeInTheDocument();
      });
      expect(screen.queryByText("Write a Review")).not.toBeInTheDocument();
    });

    it("shows ReviewForm on click", async () => {
      mockGetSavedUser.mockReturnValue({ _id: "user-1", name: "Alice", role: "STUDENT" });
      renderSection();
      await waitFor(() => {
        expect(screen.getByText("Write a Review")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("Write a Review"));
      expect(screen.getByTestId("review-form")).toBeInTheDocument();
    });
  });
});
