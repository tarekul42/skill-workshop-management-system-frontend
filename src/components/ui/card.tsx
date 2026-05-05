import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * §1.3 — Elevation & Cards
 * Default: shadow-1, rounded-2xl (16px), bg-surface-1, border border-border
 * Hover states for interactive cards: shadow-2, translateY(-2px), border-color: border-strong
 */
const cardVariants = cva(
  "rounded-2xl border border-border bg-surface-1 shadow-1 transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:border-border-strong hover:shadow-2 hover:-translate-y-0.5",
      },
      size: {
        default: "p-6",
        /** Used in Contact page and compact grids */
        sm: "rounded-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, size, ...props }: CardProps) {
  return <div className={cn(cardVariants({ size }), className)} {...props} />;
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-display text-xl font-bold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm text-foreground-subtle", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
