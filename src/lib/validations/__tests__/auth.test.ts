import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, instructorSchema } from "../auth";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email exceeding 254 chars", () => {
    const result = loginSchema.safeParse({
      email: "a".repeat(250) + "@b.co",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegister = {
    name: "John Doe",
    email: "john@example.com",
    password: "StrongP@ss1",
    confirmPassword: "StrongP@ss1",
  };

  it("accepts valid registration", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it("accepts registration with optional phone", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      phone: "+8801712345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name with special characters not in allowed set", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "John <script>",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: "DifferentP@ss1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone format", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("instructorSchema", () => {
  const validInstructor = {
    name: "Jane Instructor",
    email: "jane@example.com",
    password: "StrongP@ss1",
    confirmPassword: "StrongP@ss1",
    expertise: "React & TypeScript",
    bio: "Senior developer with 10 years of experience teaching web development.",
  };

  it("accepts valid instructor registration", () => {
    const result = instructorSchema.safeParse(validInstructor);
    expect(result.success).toBe(true);
  });

  it("rejects empty expertise", () => {
    const result = instructorSchema.safeParse({
      ...validInstructor,
      expertise: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio shorter than 1 char", () => {
    const result = instructorSchema.safeParse({
      ...validInstructor,
      bio: "",
    });
    expect(result.success).toBe(false);
  });
});
