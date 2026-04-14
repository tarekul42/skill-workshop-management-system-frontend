import Link from "next/link";
import { Search, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkshopNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-48 rounded-full border-2 border-dashed border-muted-foreground/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute size-32 rounded-full border border-muted-foreground/15 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-muted">
            <Search className="size-10 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold tracking-tight text-foreground">
          4<span className="text-primary">0</span>4
        </h1>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          Workshop Not Found
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          The workshop you are looking for might have been removed or the URL
          may be incorrect. Browse our available workshops below.
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
    </div>
  );
}
