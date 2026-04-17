import { Skeleton } from "@/components/ui/skeleton";
import { WorkshopCardSkeleton } from "@/components/shared/LoadingSkeleton";

export default function PublicWorkshopsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto mt-4 h-5 w-96" />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <WorkshopCardSkeleton count={9} variant="detailed" />
    </div>
  );
}
