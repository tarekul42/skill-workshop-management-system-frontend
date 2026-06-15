import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TableSkeleton, WorkshopCardSkeleton, StatCardSkeleton } from "../loading-skeleton";

describe("LoadingSkeleton", () => {
  describe("TableSkeleton", () => {
    it("renders default 5 rows", () => {
      const { container } = render(<TableSkeleton />);
      // Each row is a div with flex gap-4
      const rows = container.querySelectorAll(".flex.gap-4.px-2.py-1");
      expect(rows.length).toBe(5);
    });

    it("renders the specified number of rows", () => {
      const { container } = render(<TableSkeleton rows={3} />);
      const rows = container.querySelectorAll(".flex.gap-4.px-2.py-1");
      expect(rows.length).toBe(3);
    });

    it("renders 7 rows when rows=7", () => {
      const { container } = render(<TableSkeleton rows={7} />);
      const rows = container.querySelectorAll(".flex.gap-4.px-2.py-1");
      expect(rows.length).toBe(7);
    });

    it("renders 1 row when rows=1", () => {
      const { container } = render(<TableSkeleton rows={1} />);
      const rows = container.querySelectorAll(".flex.gap-4.px-2.py-1");
      expect(rows.length).toBe(1);
    });

    it("renders the correct number of columns per row", () => {
      const { container } = render(<TableSkeleton rows={1} columns={3} />);
      const row = container.querySelector(".flex.gap-4.px-2.py-1");
      // Each column is a skeleton div inside the row
      const cells = row?.querySelectorAll(".h-8");
      expect(cells?.length).toBe(3);
    });
  });

  describe("WorkshopCardSkeleton", () => {
    it("renders default 1 card", () => {
      const { container } = render(<WorkshopCardSkeleton />);
      // Each card is a Card element with overflow-hidden
      const cards = container.querySelectorAll(".overflow-hidden");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it("renders 3 cards when count=3", () => {
      const { container } = render(<WorkshopCardSkeleton count={3} />);
      // Grid wrapper + 3 cards
      const cards = container.querySelectorAll(".overflow-hidden");
      expect(cards.length).toBe(3);
    });

    it("renders 5 cards when count=5", () => {
      const { container } = render(<WorkshopCardSkeleton count={5} />);
      const cards = container.querySelectorAll(".overflow-hidden");
      expect(cards.length).toBe(5);
    });

    it("renders compact variant cards", () => {
      const { container } = render(<WorkshopCardSkeleton count={2} variant="compact" />);
      // Compact cards have h-40 image placeholder
      const imagePlaceholders = container.querySelectorAll(".h-40");
      expect(imagePlaceholders.length).toBe(2);
    });
  });

  describe("StatCardSkeleton", () => {
    it("renders default 1 card", () => {
      const { container } = render(<StatCardSkeleton />);
      // Each card has a CardHeader with skeleton elements
      const headers = container.querySelectorAll(".pb-2");
      expect(headers.length).toBeGreaterThanOrEqual(1);
    });

    it("renders 4 cards when count=4", () => {
      const { container } = render(<StatCardSkeleton count={4} />);
      const headers = container.querySelectorAll(".pb-2");
      expect(headers.length).toBe(4);
    });

    it("renders 2 cards when count=2", () => {
      const { container } = render(<StatCardSkeleton count={2} />);
      const headers = container.querySelectorAll(".pb-2");
      expect(headers.length).toBe(2);
    });
  });
});
