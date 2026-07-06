import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto h-10 w-3/4 max-w-2xl" />
        <Skeleton className="mx-auto mt-4 h-5 w-2/3 max-w-xl" />
        <Skeleton className="mx-auto mt-6 h-12 w-48 rounded-lg" />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card space-y-4 rounded-xl border p-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
