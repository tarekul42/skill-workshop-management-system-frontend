"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * §1.3 — Table component
 * Container: border-radius 16px | border 1px --border | overflow hidden
 * Header row: bg --surface-2 | height 44px | DM Sans 12px/600 | uppercase | --foreground-muted
 * Data row: height 60px | border-bottom 1px --border | transition bg 120ms ease
 * Row hover: bg --surface-1
 * Cell padding: 0 16px
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="border-border w-full overflow-hidden rounded-2xl border"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-surface-2 [&_tr]:border-border [&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-border bg-surface-2 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

/** §1.3 — Data row: height 60px, bottom border, hover bg --surface-1, transition 120ms */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-border hover:bg-surface-1 data-[state=selected]:bg-surface-2 h-15 border-b transition-colors duration-120 ease-linear",
        className
      )}
      {...props}
    />
  );
}

/** §1.3 — Header cell: DM Sans 12px/600, uppercase, letter-spacing 0.04em, --foreground-muted */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "font-body text-foreground-muted h-11 px-4 text-left align-middle text-xs font-semibold tracking-[0.04em] whitespace-nowrap uppercase has-[[role=checkbox]]:pr-0",
        className
      )}
      {...props}
    />
  );
}

/** §1.3 — Cell padding: 0 16px */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-4 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-foreground-muted mt-4 text-sm", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
