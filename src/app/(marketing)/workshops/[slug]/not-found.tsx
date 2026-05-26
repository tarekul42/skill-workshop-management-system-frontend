import Link from "next/link";
import { Search, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export default function WorkshopNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          <div className="border-muted-foreground/10 absolute size-48 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed" />
          <div className="border-muted-foreground/15 absolute size-32 animate-[spin_15s_linear_infinite_reverse] rounded-full border" />
          <div className="bg-muted relative flex size-24 items-center justify-center rounded-full">
            <Search className="text-muted-foreground/60 size-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-6xl font-bold tracking-tight">
          4<span className="text-primary">0</span>4
        </h1>
        <h2 className="text-foreground mt-3 text-xl font-semibold">Workshop Not Found</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          The workshop you are looking for might have been removed or the URL may be incorrect.
          Browse our available workshops below.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/workshops">
            <BookOpen className="mr-2 size-4" />
            Browse Workshops
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 size-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Back navigation */}
      <BackButton />
    </div>
  );
}
