import { TableSkeleton, StatCardSkeleton } from "@/components/ui/loading-skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <StatCardSkeleton count={4} />
      <div className="bg-card rounded-xl border p-6">
        <TableSkeleton rows={5} columns={6} />
      </div>
    </div>
  );
}
