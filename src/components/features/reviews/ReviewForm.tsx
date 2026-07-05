"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Star, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createReview, updateReview } from "@/lib/api/services";
import type { IReview, CreateReviewInput, UpdateReviewInput } from "@/types";

// ─── Validation Schema ───────────────────────────────────────────────

const reviewSchema = z.object({
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

type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Props ────────────────────────────────────────────────────────────

interface ReviewFormProps {
  workshopId: string;
  existingReview?: IReview;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Interactive Star Selector ────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            className={`size-7 ${
              star <= (hovered || value)
                ? "fill-warning text-warning"
                : "text-foreground-disabled fill-transparent"
            } transition-colors`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-foreground-muted ml-2 text-sm font-medium">{value} / 5</span>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────

export function ReviewForm({ workshopId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [submitError, setSubmitError] = useState("");
  const isEditing = !!existingReview;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      content: existingReview?.content ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateReviewInput) => createReview(data),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      onSuccess();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "Failed to submit review. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateReviewInput) => updateReview(existingReview!._id, data),
    onSuccess: () => {
      toast.success("Review updated successfully!");
      onSuccess();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "Failed to update review. Please try again.");
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    setSubmitError("");

    if (data.rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }

    if (isEditing) {
      updateMutation.mutate({
        rating: data.rating,
        title: data.title.trim(),
        content: data.content.trim(),
      });
    } else {
      createMutation.mutate({
        workshop: workshopId,
        rating: data.rating,
        title: data.title.trim(),
        content: data.content.trim(),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="border-border bg-surface-1 rounded-2xl border p-6">
      <h3 className="font-display text-foreground mb-6 text-lg font-bold">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-foreground text-sm font-semibold">
                  Your Rating <span className="text-danger">*</span>
                </FormLabel>
                <FormControl>
                  <StarSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-sm font-semibold">
                  Review Title <span className="text-danger">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Summarize your experience"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-sm font-semibold">
                  Your Review <span className="text-danger">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share details about your experience with this workshop..."
                    disabled={isSubmitting}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormMessage />
                  <span className="text-foreground-muted text-xs">{field.value.length}/2000</span>
                </div>
              </FormItem>
            )}
          />

          {/* Error */}
          {submitError && (
            <div
              className="border-l-danger bg-danger-subtle relative flex items-start gap-2 rounded-lg border-l-[3px] px-4 py-3"
              role="alert"
            >
              <AlertTriangle className="text-danger mt-0.5 size-4 shrink-0" />
              <p className="text-danger flex-1 pr-4 text-sm">{submitError}</p>
              <button
                type="button"
                onClick={() => setSubmitError("")}
                className="text-danger/70 hover:text-danger absolute top-2 right-2 shrink-0"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : isEditing ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-foreground-muted font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
