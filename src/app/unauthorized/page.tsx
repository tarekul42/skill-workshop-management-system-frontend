"use client";

import Link from "next/link";
import { ShieldX, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          {/* Decorative rings */}
          <div className="border-warning/10 absolute size-56 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed" />
          <div className="border-warning/15 absolute size-40 animate-[spin_15s_linear_infinite_reverse] rounded-full border" />

          {/* Central icon container */}
          <div className="bg-warning-subtle relative flex size-32 items-center justify-center rounded-full">
            <ShieldX className="text-warning/70 size-14" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-7xl font-bold tracking-tight">
          4<span className="text-warning">03</span>
        </h1>
        <h2 className="text-foreground mt-4 text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          You do not have permission to access this page. This area is restricted to authorized
          users only. If you believe this is a mistake, please contact your administrator.
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
