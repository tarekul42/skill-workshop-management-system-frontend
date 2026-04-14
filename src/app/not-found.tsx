import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/BackButton";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          {/* Decorative rings */}
          <div className="absolute size-56 rounded-full border-2 border-dashed border-muted-foreground/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute size-40 rounded-full border border-muted-foreground/15 animate-[spin_15s_linear_infinite_reverse]" />

          {/* Central icon container */}
          <div className="relative flex size-32 items-center justify-center rounded-full bg-muted">
            <Search className="size-14 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold tracking-tight text-foreground">
          4<span className="text-primary">0</span>4
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 size-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/workshops">
            <BookOpen className="mr-2 size-4" />
            Browse Workshops
          </Link>
        </Button>
      </div>

      {/* Suggested pages */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <span className="text-sm text-muted-foreground">Try visiting:</span>
        {[
          { label: "Workshops", href: "/workshops" },
          { label: "Categories", href: "/categories" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "FAQ", href: "/faq" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Back navigation */}
      <BackButton />
    </div>
  );
}
