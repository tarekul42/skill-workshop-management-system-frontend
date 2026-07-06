import { CategoryCardSkeleton } from "@/components/ui/loading-skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <CategoryCardSkeleton count={6} />
    </div>
  );
}
