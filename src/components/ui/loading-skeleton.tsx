import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ─── TableSkeleton ──────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4 px-2 pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 px-2 py-1">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={`cell-${rowIdx}-${colIdx}`} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── CardSkeleton ───────────────────────────────────────────────────

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── StatCardSkeleton ───────────────────────────────────────────────

interface StatCardSkeletonProps {
  count?: number;
}

export function StatCardSkeleton({ count = 1 }: StatCardSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── FormSkeleton ───────────────────────────────────────────────────

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// ─── WorkshopCardSkeleton ───────────────────────────────────────────

interface WorkshopCardSkeletonProps {
  count?: number;
  variant?: "compact" | "detailed";
}

export function WorkshopCardSkeleton({
  count = 1,
  variant = "detailed",
}: WorkshopCardSkeletonProps) {
  if (variant === "compact") {
    // Home page style: image placeholder, badge, title, description, footer
    return (
      <div
        className={count > 1 ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-4" : ""}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <div className="flex h-40 items-center justify-center rounded-t-xl bg-muted">
              <Skeleton className="size-10 rounded-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-2 h-5 w-full" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </CardContent>
            <CardContent className="flex items-center justify-between pt-0">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Detailed style (workshops page): image, badges, description, location/date, price + CTA
  return (
    <div
      className={count > 1 ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : ""}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <div className="relative flex aspect-16/10 items-center justify-center bg-muted">
            <Skeleton className="size-12 rounded-full" />
          </div>
          <CardContent className="flex flex-1 flex-col gap-2 pt-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-auto flex gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
          <CardContent className="flex items-center justify-between gap-2 pt-0">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── CategoryCardSkeleton ───────────────────────────────────────────

interface CategoryCardSkeletonProps {
  count?: number;
}

export function CategoryCardSkeleton({ count = 1 }: CategoryCardSkeletonProps) {
  return (
    <div
      className={
        count > 1 ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : ""
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="transition-shadow hover:shadow-md">
          <CardHeader className="items-center text-center">
            <Skeleton className="mb-2 h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-5 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── WorkshopDetailSkeleton ─────────────────────────────────────────

export function WorkshopDetailSkeleton() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-3.5" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-3.5" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-4 h-6 w-24" />
            <Skeleton className="mt-3 h-6 w-32" />
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <Skeleton className="mb-8 h-px w-full" />

          {/* Content + Sidebar */}
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left Column */}
            <div className="space-y-10">
              {/* About */}
              <section>
                <Skeleton className="mb-4 h-7 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </section>

              {/* What You'll Learn */}
              <section>
                <Skeleton className="mb-4 h-7 w-40" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Prerequisites */}
              <section>
                <Skeleton className="mb-4 h-7 w-32" />
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column — Sidebar */}
            <aside>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="mt-2 h-4 w-40" />
                  <div className="mt-2">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="mt-1 h-3 w-28" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="mt-1 h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <Skeleton className="my-10 h-px w-full" />

          {/* Similar Workshops */}
          <section className="mb-8">
            <Skeleton className="mb-6 h-7 w-40" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex aspect-16/10 items-center justify-center bg-muted">
                    <Skeleton className="size-10 rounded-full" />
                  </div>
                  <CardContent className="flex flex-col gap-2 pt-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
