"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Edit3,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getInitials, formatDate } from "@/lib/formatters";
import { getSavedUser } from "@/lib/auth-helpers";
import { getWorkshopReviews, getWorkshopReviewStats, deleteReview } from "@/lib/api/services";
import type { IReview, IReviewStats, PaginationMeta, ReviewSortOption } from "@/types";

import { ReviewForm } from "./ReviewForm";

// ─── Star Rating Display ─────────────────────────────────────────────

function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-4";

  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          role="radio"
          aria-checked={star <= rating}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={
            interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"
          }
        >
          <Star
            className={`${sizeClass} ${
              star <= (hovered || rating)
                ? "fill-warning text-warning"
                : "text-foreground-disabled fill-transparent"
            } transition-colors`}
          />
        </button>
      ))}
      {interactive && (
        <span className="sr-only" aria-live="polite">
          {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""} selected` : "No rating selected"}
        </span>
      )}
    </div>
  );
}

// ─── Rating Distribution Bar ─────────────────────────────────────────

function RatingDistribution({
  distribution,
  totalReviews,
}: {
  distribution: IReviewStats["distribution"];
  totalReviews: number;
}) {
  const stars: (keyof IReviewStats["distribution"])[] = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2.5">
      {stars.map((star) => {
        const count = distribution[star];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            <span className="text-foreground min-w-12 text-sm font-semibold">{star} star</span>
            <div className="bg-surface-3 h-2.5 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-warning h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-foreground-muted min-w-8 text-right text-xs font-medium">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Review Card ──────────────────────────────────────────────

function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: {
  review: IReview;
  currentUserId?: string;
  onEdit: (review: IReview) => void;
  onDelete: (reviewId: string) => void;
}) {
  const isOwner = currentUserId && review.user._id === currentUserId;

  return (
    <div className="border-border bg-background hover:shadow-1 rounded-2xl border p-6 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-11">
            {review.user.picture ? (
              <AvatarImage src={review.user.picture} alt={review.user.name} />
            ) : (
              <AvatarFallback className="bg-primary-subtle text-primary text-sm font-bold">
                {getInitials(review.user.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-bold">{review.user.name}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-foreground mt-2 text-base leading-snug font-semibold">
              {review.title}
            </p>
            <p className="text-foreground-subtle mt-2 text-sm leading-relaxed">{review.content}</p>
            <p className="text-foreground-muted mt-3 text-xs font-medium">
              {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && " (edited)"}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(review)}
              aria-label="Edit review"
              className="text-foreground-muted hover:text-primary size-8 rounded-lg"
            >
              <Edit3 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(review._id)}
              aria-label="Delete review"
              className="text-foreground-muted hover:text-danger size-8 rounded-lg"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Review Section ─────────────────────────────────────────────

interface ReviewSectionProps {
  workshopId: string;
}

export function ReviewSection({ workshopId }: ReviewSectionProps) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewSortOption>("newest");
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showWriteForm, setShowWriteForm] = useState(false);

  const queryClient = useQueryClient();
  const currentUser = getSavedUser();
  const limit = 5;

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["workshop-reviews", workshopId, page, sort],
    queryFn: () => getWorkshopReviews(workshopId, { page, limit, sort }),
    staleTime: 30_000,
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["workshop-review-stats", workshopId],
    queryFn: () => getWorkshopReviewStats(workshopId),
    staleTime: 60_000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["workshop-reviews", workshopId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workshop-review-stats", workshopId],
      });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete review");
    },
  });

  const reviews = reviewsData?.data ?? [];
  const meta: PaginationMeta = reviewsData?.meta ?? {
    page: 1,
    limit,
    total: 0,
    totalPage: 0,
  };
  const stats: IReviewStats = statsData ?? {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const handleSortChange = (value: string) => {
    setSort(value as ReviewSortOption);
    setPage(1);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  return (
    <section id="reviews">
      <h2 className="font-display text-foreground mb-6 text-2xl font-bold">Student Reviews</h2>
      <Separator className="mb-8" />

      {/* ── Stats + Distribution Row ──────────────────────────────── */}
      <div className="mb-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left: Average Rating Card */}
        <div className="border-border bg-surface-1 flex flex-col items-center justify-center rounded-2xl border p-8">
          {statsLoading ? (
            <Loader2 className="text-primary size-8 animate-spin" />
          ) : (
            <>
              <span className="font-display text-foreground text-5xl font-extrabold tracking-tight">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
              </span>
              <StarRating rating={Math.round(stats.averageRating)} size="md" />
              <span className="text-foreground-muted mt-2 text-sm font-medium">
                Based on {stats.totalReviews} review
                {stats.totalReviews !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {/* Right: Distribution */}
        <div className="border-border bg-surface-1 rounded-2xl border p-8">
          {statsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="text-primary size-6 animate-spin" />
            </div>
          ) : stats.totalReviews > 0 ? (
            <RatingDistribution
              distribution={stats.distribution}
              totalReviews={stats.totalReviews}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MessageSquare className="text-foreground-disabled mb-3 size-10" />
              <p className="text-foreground text-sm font-bold">No reviews yet</p>
              <p className="text-foreground-muted mt-1 text-xs">
                Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sort + Write Review Bar ───────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-foreground text-sm font-semibold">Sort by:</span>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="hover:bg-surface-2 h-9 w-40 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentUser && !editingReview && (
          <Button
            onClick={() => setShowWriteForm(!showWriteForm)}
            variant={showWriteForm ? "outline" : "default"}
            size="sm"
            className="font-semibold"
          >
            {showWriteForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* ── Write / Edit Review Form ──────────────────────────────── */}
      {showWriteForm && !editingReview && (
        <div className="mb-8">
          <ReviewForm
            workshopId={workshopId}
            onSuccess={() => {
              setShowWriteForm(false);
              queryClient.invalidateQueries({
                queryKey: ["workshop-reviews", workshopId],
              });
              queryClient.invalidateQueries({
                queryKey: ["workshop-review-stats", workshopId],
              });
            }}
            onCancel={() => setShowWriteForm(false)}
          />
        </div>
      )}

      {editingReview && (
        <div className="mb-8">
          <ReviewForm
            workshopId={workshopId}
            existingReview={editingReview}
            onSuccess={() => {
              setEditingReview(null);
              queryClient.invalidateQueries({
                queryKey: ["workshop-reviews", workshopId],
              });
              queryClient.invalidateQueries({
                queryKey: ["workshop-review-stats", workshopId],
              });
            }}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {/* ── Reviews List ──────────────────────────────────────────── */}
      {reviewsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : reviewsError ? (
        <div
          className="border-l-danger bg-danger-subtle flex items-start gap-3 rounded-lg border-l-[3px] px-4 py-3"
          role="alert"
        >
          <AlertTriangle className="text-danger mt-0.5 size-4 shrink-0" />
          <p className="text-danger text-sm">Failed to load reviews. Please try again later.</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUser?._id}
              onEdit={setEditingReview}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
          <MessageSquare className="text-foreground-disabled mb-4 size-12" />
          <p className="text-foreground text-lg font-bold">No reviews yet</p>
          <p className="text-foreground-muted mt-2 max-w-sm text-sm">
            Be the first to share your experience with this workshop!
          </p>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {meta.totalPage > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            className="border-border bg-surface-1 hover:bg-surface-2 size-9 rounded-xl transition-all disabled:opacity-30"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(meta.totalPage, 5) }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = page === pageNum;
              return (
                <Button
                  key={pageNum}
                  variant={isCurrent ? "default" : "ghost"}
                  size="icon-xs"
                  className={`size-9 rounded-xl text-xs font-bold transition-all ${
                    !isCurrent && "text-foreground-muted hover:bg-surface-2"
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {meta.totalPage > 5 && <span className="text-foreground-disabled px-1">...</span>}
          </div>

          <Button
            variant="outline"
            size="icon-xs"
            className="border-border bg-surface-1 hover:bg-surface-2 size-9 rounded-xl transition-all disabled:opacity-30"
            onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
            disabled={page >= meta.totalPage}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </section>
  );
}

// ─── Separator (local to avoid extra imports) ────────────────────────

function Separator({ className = "" }: { className?: string }) {
  return <div className={`bg-border h-px w-full ${className}`} role="separator" />;
}
