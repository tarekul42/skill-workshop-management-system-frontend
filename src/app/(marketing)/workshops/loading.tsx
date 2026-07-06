import { WorkshopCardSkeleton } from "@/components/ui/loading-skeleton";

export default function WorkshopsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
      <WorkshopCardSkeleton count={6} variant="detailed" />
    </div>
  );
}
