import { z } from "zod";

export const levelSchema = z.object({
  _id: z.string(),
  name: z.string(),
});

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  thumbnail: z.string().optional(),
  description: z.string().optional(),
});

const createdBySchema = z
  .union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      expertise: z.string().optional(),
      bio: z.string().optional(),
    }),
  ])
  .optional();

export const workshopSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()),
  location: z.string().optional(),
  price: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  whatYouLearn: z.array(z.string()),
  prerequisites: z.array(z.string()),
  benefits: z.array(z.string()),
  syllabus: z.array(z.string()),
  maxSeats: z.number().optional(),
  minAge: z.number().optional(),
  currentEnrollments: z.number(),
  category: z.union([z.string(), categorySchema]),
  level: z.union([z.string(), levelSchema]),
  createdBy: createdBySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const enrollmentSchema = z.object({
  _id: z.string(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }),
  workshop: z.object({
    _id: z.string(),
    title: z.string(),
    slug: z.string().optional(),
    price: z.number().optional(),
    images: z.array(z.string()).optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
  }),
  payment: z
    .object({
      _id: z.string(),
      amount: z.number(),
      status: z.string(),
      transactionId: z.string(),
    })
    .optional(),
  studentCount: z.number(),
  status: z.enum(["PENDING", "CANCEL", "COMPLETE", "FAILED"]),
  createdAt: z.string(),
});
