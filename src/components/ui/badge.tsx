import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * §1.3 — Badge / Tag component
 * Base: h-6 (24px), padding 0 10px, border-radius 6px
 * Font: 12px / 600 / DM Sans, letter-spacing 0.02em
 * Large variant: h-[30px], padding 0 14px, border-radius 8px, font 13px
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md font-body text-xs font-semibold tracking-[0.02em] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-surface-3 text-foreground",
        success: "bg-success-subtle text-success",
        danger: "bg-danger-subtle text-danger",
        warning: "bg-warning-subtle text-warning",
        info: "bg-info-subtle text-info",
        outline: "border-[1.5px] border-border-strong text-foreground",
        accent: "bg-accent-subtle text-accent-foreground",
        muted: "bg-surface-3 text-foreground-muted",
      },
      size: {
        /** Default: h-6 (24px), px-2.5, rounded-[6px] */
        default: "h-6 px-2.5 rounded-[6px]",
        /** Large: h-[30px], px-3.5, text-[13px] — for Workshop Detail hero §3 */
        lg: "h-[30px] rounded-lg px-3.5 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
