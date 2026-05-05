"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[15px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-45 select-none active:scale-[0.98] tracking-[0.01em]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-[10px] px-5 py-2.5 shadow-[0_1px_3px_oklch(0_0_0/_0.12),_0_4px_12px_oklch(0.42_0.25_272/_0.30)] hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_2px_6px_oklch(0_0_0/_0.15),_0_8px_24px_oklch(0.42_0.25_272/_0.35)] active:translate-y-0 active:shadow-[0_1px_2px_oklch(0_0_0/_0.10)]",
        outline:
          "border-[1.5px] border-border-strong bg-transparent text-foreground rounded-[10px] px-[19px] py-2 hover:bg-surface-2 hover:border-primary hover:text-primary hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-accent text-accent-foreground rounded-[10px] px-5 py-2.5 shadow-amber-glow hover:bg-accent-hover hover:-translate-y-px active:translate-y-0",
        ghost:
          "bg-transparent text-foreground-subtle rounded-lg hover:bg-surface-2 hover:text-foreground",
        destructive:
          "bg-danger text-danger-foreground rounded-[10px] px-5 py-2.5 shadow-[0_4px_12px_oklch(0.52_0.24_22/_0.30)] hover:bg-danger-hover hover:-translate-y-px active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-[44px]",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-lg p-0",
        "icon-xs": "h-7 w-7 rounded-md p-0",
        "icon-sm": "h-8 w-8 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
