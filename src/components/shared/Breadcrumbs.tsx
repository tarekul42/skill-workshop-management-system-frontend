"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
  homeLabel?: string;
}

export function Breadcrumbs({
  className,
  homeLabel = "Home",
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Split path and filter out empty strings
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // Generate breadcrumb items
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    // Format label: replace hyphens with spaces and capitalize
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return { label, href, isLast: index === pathSegments.length - 1 };
  });

  if (pathname === "/") return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-muted-foreground mb-6",
        className,
      )}
    >
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span className="sr-only sm:not-sr-only">{homeLabel}</span>
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.href} className="flex items-center gap-2">
            <ChevronRight className="size-3.5 shrink-0" />
            {breadcrumb.isLast ? (
              <span className="font-medium text-foreground truncate max-w-37.5 sm:max-w-75">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-foreground transition-colors truncate max-w-25 sm:max-w-none"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
