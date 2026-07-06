import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnrollButton } from "../EnrollButton";

const mockPush = vi.fn();
const mockGetSavedUser = vi.fn();
const mockGetMyEnrollments = vi.fn();
const mockCreateEnrollment = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-helpers", () => ({
  getSavedUser: (...args: unknown[]) => mockGetSavedUser(...args),
}));

vi.mock("@/lib/api/services", () => ({
  getMyEnrollments: (...args: unknown[]) => mockGetMyEnrollments(...args),
  createEnrollment: (...args: unknown[]) => mockCreateEnrollment(...args),
}));

const defaultProps = {
  workshopId: "ws-1",
  slug: "test-workshop",
  price: 100,
  seatsAvailable: 10,
};

function renderButton(props = {}) {
  return render(<EnrollButton {...defaultProps} {...props} />);
}

describe("EnrollButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSavedUser.mockReturnValue({ _id: "user-1", name: "Test User", role: "STUDENT" });
    mockGetMyEnrollments.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initial render states ──────────────────────────────────────

  it("shows checking shimmer on mount", () => {
    // getMyEnrollments never resolves during this test
    mockGetMyEnrollments.mockImplementation(() => new Promise(() => {}));
    renderButton();
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("renders idle enroll button when not enrolled", async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
  });

  it("renders enrolled state when enrollment exists with COMPLETE status", async () => {
    mockGetMyEnrollments.mockResolvedValue([
      {
        workshop: "ws-1",
        status: "COMPLETE",
      },
    ]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText("View Workshop")).toBeInTheDocument();
    });
  });

  it("renders enrolled state when enrollment exists with PENDING status", async () => {
    mockGetMyEnrollments.mockResolvedValue([
      {
        workshop: "ws-1",
        status: "PENDING",
      },
    ]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText("View Workshop")).toBeInTheDocument();
    });
  });

  it("shows enroll button for failed/cancelled past enrollment", async () => {
    mockGetMyEnrollments.mockResolvedValue([
      {
        workshop: "ws-1",
        status: "FAILED",
      },
    ]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
  });

  // ── Seats / Disabled ───────────────────────────────────────────

  it('shows "Workshop is Full" when seatsAvailable <= 0', async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    renderButton({ seatsAvailable: 0 });
    await waitFor(() => {
      expect(screen.getByText("Workshop is Full")).toBeInTheDocument();
    });
  });

  // ── Login redirect hint ────────────────────────────────────────

  it("shows login redirect hint when user is not logged in", async () => {
    mockGetSavedUser.mockReturnValue(null);
    mockGetMyEnrollments.mockResolvedValue([]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/redirected to login/)).toBeInTheDocument();
    });
  });

  it("redirects to login when unauthenticated user clicks enroll", async () => {
    mockGetSavedUser.mockReturnValue(null);
    mockGetMyEnrollments.mockResolvedValue([]);
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    expect(mockPush).toHaveBeenCalledWith("/login?redirect=/workshops/test-workshop");
  });

  // ── Enrollment flow ────────────────────────────────────────────

  it("enters enrolling state on click and renders processing", async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    mockCreateEnrollment.mockImplementation(() => new Promise(() => {}));
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("redirects to payment URL when paymentUrl is returned", async () => {
    const originalLocation = window.location;
    delete (window as Record<string, unknown>).location;
    window.location = { ...originalLocation, href: "", assign: vi.fn() } as unknown as Location;

    mockGetMyEnrollments.mockResolvedValue([]);
    mockCreateEnrollment.mockResolvedValue({ paymentUrl: "https://pay.example.com/123" });
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    await waitFor(() => {
      expect(screen.getByText("Redirecting to Payment...")).toBeInTheDocument();
    });

    window.location = originalLocation;
  });

  it("shows enrolled state on successful enrollment without paymentUrl", async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    mockCreateEnrollment.mockResolvedValue({});
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    await waitFor(() => {
      expect(screen.getByText("View Workshop")).toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────

  it("shows error state with retry button on failure", async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    mockCreateEnrollment.mockRejectedValue(new Error("Payment failed"));
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    await waitFor(() => {
      expect(screen.getByText("Retry ↺")).toBeInTheDocument();
    });
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  it('shows enrolled state when error message includes "active enrollment"', async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    mockCreateEnrollment.mockRejectedValue(new Error("Active enrollment already exists"));
    renderButton();
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Enroll Now/));
    await waitFor(() => {
      expect(screen.getByText("View Workshop")).toBeInTheDocument();
    });
  });

  // ── Payment complete event listener ────────────────────────────

  it("re-checks enrollment status on payment-complete event", async () => {
    mockGetMyEnrollments.mockResolvedValue([]);
    renderButton();
    // First check resolves to idle
    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
    expect(mockGetMyEnrollments).toHaveBeenCalledTimes(1);

    // Now make it return enrolled and fire event
    mockGetMyEnrollments.mockResolvedValue([{ workshop: "ws-1", status: "COMPLETE" }]);
    window.dispatchEvent(new Event("payment-complete"));
    await waitFor(() => {
      expect(screen.getByText("View Workshop")).toBeInTheDocument();
    });
    expect(mockGetMyEnrollments).toHaveBeenCalledTimes(2);
  });
});
