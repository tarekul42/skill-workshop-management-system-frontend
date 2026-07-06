import { FormSkeleton } from "@/components/ui/loading-skeleton";

export default function CreateWorkshopLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="bg-card rounded-xl border p-6">
        <FormSkeleton fields={8} />
      </div>
    </div>
  );
}
