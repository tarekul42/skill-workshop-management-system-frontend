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

function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="border-border hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx} className="h-15 px-4">
              <div className="bg-surface-2 animate-shimmer h-4 w-full rounded-md" />
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
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const handleDownloadCSV = () => {
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible())
      .map((col) => col.id);

    const headerRow = visibleColumns
      .map((id) => id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(",");

    const dataRows = table
      .getFilteredRowModel()
      .rows.map((row) =>
        visibleColumns
          .map((id) => {
            const value = row.getValue(id);
            const str = String(value ?? "");
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          })
          .join(",")
      )
      .join("\n");

    const csv = `${headerRow}\n${dataRows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableData = useMemo(() => (isLoading ? [] : data), [isLoading, data]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions; wrapped config in useMemo to prevent unnecessary re-renders
  const table = useReactTable(
    useMemo(
      () => ({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
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
      }),
      [tableData, columns, enablePagination, sorting, globalFilter, columnVisibility, pageSize]
    )
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Container ── */}
      <div className="border-border bg-surface-1 shadow-raised overflow-hidden rounded-[20px] border">
        {/* ── Toolbar Row ── */}
        <div className="bg-surface-2 border-border flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-md flex-1 items-center gap-3">
            {searchKey && (
              <div className="relative flex-1">
                <Search className="text-foreground-disabled group-focus-within:text-primary absolute top-1/2 left-4 size-4.5 -translate-y-1/2 transition-colors" />
                <Input
                  placeholder={searchPlaceholder}
                  value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                  onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                  className="bg-background border-border-strong/10 focus:border-primary/30 h-11 rounded-xl pl-11 transition-all focus:shadow-sm"
                />
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowGlobalSearch((prev) => !prev)}
              className="bg-background border-border-strong/30 hover:border-primary/50 hover:bg-primary-subtle/30 h-11 rounded-xl border-dashed"
            >
              <Filter className="text-foreground-muted mr-2.5 size-4" />
              Filters
            </Button>
            {showGlobalSearch && (
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="bg-background border-border-strong/10 focus:border-primary/30 h-11 rounded-xl pl-3 transition-all focus:shadow-sm"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {actions && <div className="mr-2 flex items-center gap-2">{actions}</div>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle column visibility"
                  className="hover:bg-surface-3 h-11 w-11 rounded-xl transition-colors"
                >
                  <Settings2 className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-3 w-50 rounded-xl p-2">
                <p className="text-foreground-muted px-2 py-2 text-[11px] font-bold tracking-widest uppercase">
                  Toggle Columns
                </p>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="rounded-lg py-2 capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Download table data"
              onClick={handleDownloadCSV}
              className="hover:bg-surface-3 h-11 w-11 rounded-xl transition-colors"
            >
              <Download className="size-5" />
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <Table>
          <TableHeader className="bg-surface-2/50 h-11">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-foreground-muted px-4 text-[12px] font-bold tracking-widest uppercase",
                        isSortable &&
                          "hover:text-foreground group cursor-pointer transition-colors select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className="border-border hover:bg-surface-1/50 h-15 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground px-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="bg-surface-2 mb-2 flex size-12 items-center justify-center rounded-full">
                      <Search className="text-foreground-disabled size-6" />
                    </div>
                    <p className="text-foreground text-sm font-bold">{emptyMessage}</p>
                    <p className="text-foreground-muted max-w-50 text-xs">
                      Try adjusting your filters or search terms to find what you&apos;re looking
                      for.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ── Pagination Bar ── */}
        {enablePagination && !isLoading && (
          <div className="bg-surface-2/50 border-top border-border flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
            <div className="flex items-center gap-6">
              <p className="text-foreground-muted text-xs font-medium">
                Showing{" "}
                <span className="text-foreground font-bold">
                  {table.getState().pagination.pageIndex * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="text-foreground font-bold">
                  {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)}
                </span>{" "}
                of <span className="text-foreground font-bold">{data.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <span className="text-foreground-disabled text-[11px] font-bold tracking-tighter uppercase">
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
                  <SelectTrigger className="bg-surface-1 border-border h-8 w-18 rounded-lg text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-xs">
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
                className="border-border bg-surface-1 hover:bg-surface-2 size-9 rounded-xl transition-all disabled:opacity-30"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(table.getPageCount(), 5) }).map((_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const isCurrent = pageIndex === i;
                  return (
                    <Button
                      key={i}
                      variant={isCurrent ? "default" : "ghost"}
                      size="icon-xs"
                      className={cn(
                        "size-9 rounded-xl text-xs font-bold transition-all",
                        !isCurrent && "hover:bg-surface-3 text-foreground-muted"
                      )}
                      onClick={() => table.setPageIndex(i)}
                    >
                      {i + 1}
                    </Button>
                  );
                })}
                {table.getPageCount() > 5 && (
                  <span className="text-foreground-disabled px-1">...</span>
                )}
              </div>

              <Button
                variant="outline"
                size="icon-xs"
                className="border-border bg-surface-1 hover:bg-surface-2 size-9 rounded-xl transition-all disabled:opacity-30"
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
