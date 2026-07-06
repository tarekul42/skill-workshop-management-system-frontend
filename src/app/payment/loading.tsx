import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4 text-center">
        <Skeleton className="mx-auto size-20 rounded-full" />
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="mx-auto h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
