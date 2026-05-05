import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
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
        default: "h-6 px-2.5",
        lg: "h-7.5 px-3.5 text-[13px]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
