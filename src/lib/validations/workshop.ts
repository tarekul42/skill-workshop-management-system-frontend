import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be at most 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be at most 2000 characters"),
});

export const workshopSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  location: z.string().max(500, "Location must be at most 500 characters").optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  whatYouLearn: z.array(z.string().min(1).max(200)).max(50).optional(),
  prerequisites: z.array(z.string().min(1).max(200)).max(50).optional(),
  benefits: z.array(z.string().min(1).max(200)).max(50).optional(),
  syllabus: z.array(z.string().min(1).max(200)).max(50).optional(),
  maxSeats: z.coerce.number().min(1, "Max seats must be at least 1").max(100000).optional(),
  minAge: z.coerce.number().min(1, "Min age must be at least 1").max(150).optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
});

export const levelSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().max(300, "Address must be at most 300 characters").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const enrollmentSchema = z.object({
  workshop: z.string().min(1, "Workshop is required"),
  studentCount: z.coerce.number().min(1, "At least 1 student").max(100, "Maximum 100 students"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type WorkshopInput = z.infer<typeof workshopSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type LevelInput = z.infer<typeof levelSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
