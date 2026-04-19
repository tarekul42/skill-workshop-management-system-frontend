"use client";

import Link from "next/link";
import { ShieldX, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/BackButton";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          {/* Decorative rings */}
          <div className="absolute size-56 rounded-full border-2 border-dashed border-amber-500/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute size-40 rounded-full border border-amber-500/15 animate-[spin_15s_linear_infinite_reverse]" />

          {/* Central icon container */}
          <div className="relative flex size-32 items-center justify-center rounded-full bg-amber-500/10">
            <ShieldX className="size-14 text-amber-600/70 dark:text-amber-400/70" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold tracking-tight text-foreground">
          4<span className="text-amber-600 dark:text-amber-400">03</span>
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Access Denied
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          You do not have permission to access this page. This area is
          restricted to authorized users only. If you believe this is a mistake,
          please contact your administrator.
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
          <Link href="/login">
            <LogIn className="mr-2 size-4" />
            Sign In
          </Link>
        </Button>
      </div>

      {/* Back navigation */}
      <BackButton />
    </div>
  );
}
