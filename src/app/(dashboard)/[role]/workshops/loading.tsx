import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";

export default function WorkshopsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        </div>
        <div className="p-4">
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>
    </div>
  );
}
