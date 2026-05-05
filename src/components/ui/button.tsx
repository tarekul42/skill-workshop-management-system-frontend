"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-45 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-primary-glow hover:bg-primary-hover hover:-translate-y-px active:translate-y-0",
        outline:
          "border-[1.5px] border-border-strong bg-transparent text-foreground hover:bg-surface-2 hover:border-primary hover:text-primary hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-accent text-accent-foreground shadow-amber-glow hover:bg-accent-hover hover:-translate-y-px active:translate-y-0",
        ghost:
          "bg-transparent text-foreground-subtle hover:bg-surface-2 hover:text-foreground",
        destructive:
          "bg-danger text-danger-foreground shadow-[0_4px_12px_oklch(0.52_0.24_22_/_0.30)] hover:bg-danger-hover hover:-translate-y-px active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
