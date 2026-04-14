import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </nav>
        <div className="border-t p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header skeleton */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </header>

        {/* Page content skeleton */}
        <main className="flex-1 space-y-6 p-6">
          {/* Page header */}
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="size-9 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>

          {/* Content card skeleton */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
