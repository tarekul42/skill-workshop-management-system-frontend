import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * §1.3 — Elevation & Cards
 * Default: shadow-1, rounded-2xl (16px), bg-surface-1, border border-border
 * Hover states for interactive cards: shadow-3, translateY(-4px), border-color: primary/20
 */
const cardVariants = cva(
  "rounded-2xl border border-border bg-surface-1 shadow-1 transition-all duration-300 ease-out-expo",
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:border-primary/20 hover:shadow-3 hover:-translate-y-1 active:scale-[0.99] active:translate-y-0",
      },
      size: {
        default: "p-0", // Standard card uses p-0 because sections (Header, Content, Footer) have their own padding
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

function Card({ className, size, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ size, interactive }), className)}
      {...props}
    />
  );
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
