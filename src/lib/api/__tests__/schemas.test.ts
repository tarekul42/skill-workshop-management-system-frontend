import { describe, it, expect } from "vitest";
import { levelSchema, categorySchema, workshopSchema, enrollmentSchema } from "../schemas";

describe("levelSchema", () => {
  it("should validate a valid level", () => {
    const result = levelSchema.parse({ _id: "1", name: "Beginner" });
    expect(result).toEqual({ _id: "1", name: "Beginner" });
  });

  it("should reject missing name", () => {
    expect(() => levelSchema.parse({ _id: "1" })).toThrow();
  });
});

describe("categorySchema", () => {
  it("should validate a valid category", () => {
    const result = categorySchema.parse({
      _id: "1",
      name: "Web Dev",
      slug: "web-dev",
      thumbnail: "img.jpg",
    });
    expect(result.name).toBe("Web Dev");
  });

  it("should accept optional fields", () => {
    const result = categorySchema.parse({ _id: "1", name: "Dev", slug: "dev" });
    expect(result.thumbnail).toBeUndefined();
  });
});

describe("workshopSchema", () => {
  const baseWorkshop = {
    _id: "ws-1",
    title: "React Basics",
    slug: "react-basics",
    images: [],
    whatYouLearn: [],
    prerequisites: [],
    benefits: [],
    syllabus: [],
    currentEnrollments: 0,
    category: "cat-1",
    level: "lvl-1",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it("should validate a minimal workshop", () => {
    const result = workshopSchema.parse(baseWorkshop);
    expect(result.title).toBe("React Basics");
  });

  it("should validate with category object", () => {
    const result = workshopSchema.parse({
      ...baseWorkshop,
      category: { _id: "1", name: "Web", slug: "web" },
    });
    expect(result.category).toEqual({ _id: "1", name: "Web", slug: "web" });
  });

  it("should validate with level object", () => {
    const result = workshopSchema.parse({
      ...baseWorkshop,
      level: { _id: "1", name: "Advanced" },
    });
    expect(result.level).toEqual({ _id: "1", name: "Advanced" });
  });

  it("should accept valid title values", () => {
    expect(workshopSchema.parse({ ...baseWorkshop, title: "Advanced React" }).title).toBe(
      "Advanced React"
    );
  });
});

describe("enrollmentSchema", () => {
  const baseEnrollment = {
    _id: "enr-1",
    user: { _id: "u-1", name: "Test", email: "test@test.com" },
    workshop: { _id: "w-1", title: "Workshop" },
    studentCount: 1,
    status: "PENDING" as const,
    createdAt: "2026-01-01",
  };

  it("should validate a pending enrollment", () => {
    const result = enrollmentSchema.parse(baseEnrollment);
    expect(result.status).toBe("PENDING");
  });

  it("should validate completion status", () => {
    const result = enrollmentSchema.parse({ ...baseEnrollment, status: "COMPLETE" });
    expect(result.status).toBe("COMPLETE");
  });

  it("should validate enrollment with payment", () => {
    const result = enrollmentSchema.parse({
      ...baseEnrollment,
      payment: { _id: "p-1", amount: 2500, status: "PAID", transactionId: "txn-1" },
    });
    expect(result.payment?.amount).toBe(2500);
  });

  it("should reject invalid status", () => {
    expect(() => enrollmentSchema.parse({ ...baseEnrollment, status: "INVALID" })).toThrow();
  });
});
