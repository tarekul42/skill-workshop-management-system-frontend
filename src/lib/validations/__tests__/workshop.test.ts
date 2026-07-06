import { describe, it, expect } from "vitest";
import {
  reviewSchema,
  workshopSchema,
  categorySchema,
  levelSchema,
  profileSchema,
  changePasswordSchema,
  enrollmentSchema,
} from "../workshop";

describe("reviewSchema", () => {
  const valid = { rating: 4, title: "Great workshop", content: "I learned a lot from this workshop." };

  it("accepts valid review", () => {
    expect(reviewSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects rating < 1", () => {
    expect(reviewSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false);
  });

  it("rejects rating > 5", () => {
    expect(reviewSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });

  it("rejects short title", () => {
    expect(reviewSchema.safeParse({ ...valid, title: "AB" }).success).toBe(false);
  });

  it("rejects short content", () => {
    expect(reviewSchema.safeParse({ ...valid, content: "Short" }).success).toBe(false);
  });
});

describe("workshopSchema", () => {
  const valid = {
    title: "React Masterclass",
    startDate: "2024-06-01",
    endDate: "2024-06-05",
    level: "lvl123",
    category: "cat123",
  };

  it("accepts valid workshop with minimum fields", () => {
    expect(workshopSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts workshop with price 0 (free)", () => {
    expect(workshopSchema.safeParse({ ...valid, price: 0 }).success).toBe(true);
  });

  it("rejects negative price", () => {
    expect(workshopSchema.safeParse({ ...valid, price: -5 }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(workshopSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("rejects short title", () => {
    expect(workshopSchema.safeParse({ ...valid, title: "AB" }).success).toBe(false);
  });

  it("rejects empty level", () => {
    expect(workshopSchema.safeParse({ ...valid, level: "" }).success).toBe(false);
  });
});

describe("categorySchema", () => {
  const valid = { name: "Technology" };

  it("accepts valid category", () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short name", () => {
    expect(categorySchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("levelSchema", () => {
  const valid = { name: "Advanced" };

  it("accepts valid level", () => {
    expect(levelSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short name", () => {
    expect(levelSchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  const valid = { name: "John Doe" };

  it("accepts valid profile", () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts profile with optional fields", () => {
    expect(
      profileSchema.safeParse({ name: "Jane", phone: "+8801712345678", address: "Dhaka" }).success,
    ).toBe(true);
  });

  it("rejects short name", () => {
    expect(profileSchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "OldPass1!",
    newPassword: "NewStrong1!",
    confirmPassword: "NewStrong1!",
  };

  it("accepts valid password change", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, confirmPassword: "Different1!" }).success,
    ).toBe(false);
  });

  it("rejects weak new password", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, newPassword: "weak" }).success,
    ).toBe(false);
  });

  it("rejects same current and new password", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: "SamePass1!", newPassword: "SamePass1!", confirmPassword: "SamePass1!" }).success,
    ).toBe(false);
  });
});

describe("enrollmentSchema", () => {
  const valid = { workshop: "ws123", studentCount: 1 };

  it("accepts valid enrollment", () => {
    expect(enrollmentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects zero student count", () => {
    expect(enrollmentSchema.safeParse({ ...valid, studentCount: 0 }).success).toBe(false);
  });

  it("rejects empty workshop", () => {
    expect(enrollmentSchema.safeParse({ ...valid, workshop: "" }).success).toBe(false);
  });
});
