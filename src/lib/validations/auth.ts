import { z } from "zod";
import { passwordSchema } from "@/lib/validation/password";

const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email must be at most 254 characters");

const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters")
  .regex(/^[a-zA-Z0-9 .,!?@\-'():;]+$/, "Name contains invalid characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const instructorSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    expertise: z
      .string()
      .min(1, "Expertise is required")
      .max(200, "Expertise must be at most 200 characters"),
    bio: z.string().min(1, "Bio is required").max(300, "Bio must be at most 300 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InstructorInput = z.infer<typeof instructorSchema>;
