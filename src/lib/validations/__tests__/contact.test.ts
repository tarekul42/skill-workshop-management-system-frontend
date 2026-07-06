import { describe, it, expect } from "vitest";
import { contactSchema } from "../contact";

describe("contactSchema", () => {
  const validContact = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Workshop Inquiry",
    message: "I would like to know more about the upcoming React workshop.",
  };

  it("accepts valid contact submission", () => {
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      name: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      email: "not-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty subject", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      subject: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects subject shorter than 3 chars", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      subject: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 chars", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      message: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 5000 chars", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
