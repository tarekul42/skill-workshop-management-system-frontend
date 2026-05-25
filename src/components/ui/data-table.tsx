"use client";

import React, { useState, useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
  Download,
  Filter,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: string;
  enablePagination?: boolean;
  pageSize?: number;
  actions?: React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

// ─── Table Skeleton ─────────────────────────────────────────────────

function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="hover:bg-transparent border-border">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx} className="h-[60px] px-4">
              <div className="h-4 w-full rounded-md bg-surface-2 animate-shimmer" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search records...",
  searchKey,
  enablePagination = true,
  pageSize: initialPageSize = 10,
  actions,
  className,
  emptyMessage = "No records found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnVisibility, setColumnVisibility] = useState({});

  const tableData = useMemo(() => (isLoading ? [] : data), [isLoading, data]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Container ── */}
      <div className="rounded-[20px] border border-border bg-surface-1 shadow-raised overflow-hidden">
        {/* ── Toolbar Row ── */}
        <div className="flex flex-col gap-4 p-5 bg-surface-2 sm:flex-row sm:items-center sm:justify-between border-b border-border">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {searchKey && (
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-foreground-disabled transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder={searchPlaceholder}
                  value={
                    (table.getColumn(searchKey)?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(e) =>
                    table.getColumn(searchKey)?.setFilterValue(e.target.value)
                  }
                  className="pl-11 h-11 rounded-xl bg-background border-border-strong/10 focus:border-primary/30 focus:shadow-sm transition-all"
                />
              </div>
            )}
            <Button
              variant="outline"
              className="h-11 rounded-xl bg-background border-dashed border-border-strong/30 hover:border-primary/50 hover:bg-primary-subtle/30"
            >
              <Filter className="size-4 mr-2.5 text-foreground-muted" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {actions && (
              <div className="flex items-center gap-2 mr-2">{actions}</div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl hover:bg-surface-3 transition-colors"
                >
                  <Settings2 className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px] rounded-xl p-2 shadow-3"
              >
                <p className="px-2 py-2 text-[11px] font-bold text-foreground-muted uppercase tracking-[0.1em]">
                  Toggle Columns
                </p>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize rounded-lg py-2"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-surface-3 transition-colors"
            >
              <Download className="size-5" />
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2/50 h-11">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-4 text-[12px] font-bold uppercase tracking-widest text-foreground-muted",
                          isSortable &&
                            "cursor-pointer select-none hover:text-foreground transition-colors group",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {isSortable && (
                            <span className="text-foreground-disabled group-hover:text-foreground transition-colors">
                              {sortDir === "asc" ? (
                                <ArrowUp className="size-3" />
                              ) : sortDir === "desc" ? (
                                <ArrowDown className="size-3" />
                              ) : (
                                <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={pageSize} columns={columns.length} />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-border hover:bg-surface-1/50 transition-colors h-[60px]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 text-sm text-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-12 rounded-full bg-surface-2 flex items-center justify-center mb-2">
                        <Search className="size-6 text-foreground-disabled" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {emptyMessage}
                      </p>
                      <p className="text-xs text-foreground-muted max-w-[200px]">
                        Try adjusting your filters or search terms to find what
                        you&apos;re looking for.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ── */}
        {enablePagination && !isLoading && (
          <div className="flex flex-col items-center justify-between gap-4 p-4 bg-surface-2/50 border-top border-border sm:flex-row">
            <div className="flex items-center gap-6">
              <p className="text-xs font-medium text-foreground-muted">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {table.getState().pagination.pageIndex * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-foreground">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    data.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-foreground">{data.length}</span>{" "}
                results
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-foreground-disabled uppercase tracking-tighter">
                  Page Size
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    const newSize = Number(value);
                    setPageSize(newSize);
                    table.setPageSize(newSize);
                  }}
                >
                  <SelectTrigger className="h-8 w-18 rounded-lg bg-surface-1 border-border text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="text-xs"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-xs"
                className="size-9 rounded-xl border-border bg-surface-1 hover:bg-surface-2 disabled:opacity-30 transition-all"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(table.getPageCount(), 5) }).map(
                  (_, i) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const isCurrent = pageIndex === i;
                    return (
                      <Button
                        key={i}
                        variant={isCurrent ? "default" : "ghost"}
                        size="icon-xs"
                        className={cn(
                          "size-9 rounded-xl font-bold text-xs transition-all",
                          !isCurrent &&
                            "hover:bg-surface-3 text-foreground-muted",
                        )}
                        onClick={() => table.setPageIndex(i)}
                      >
                        {i + 1}
                      </Button>
                    );
                  },
                )}
                {table.getPageCount() > 5 && (
                  <span className="px-1 text-foreground-disabled">...</span>
                )}
              </div>

              <Button
                variant="outline"
                size="icon-xs"
                className="size-9 rounded-xl border-border bg-surface-1 hover:bg-surface-2 disabled:opacity-30 transition-all"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
