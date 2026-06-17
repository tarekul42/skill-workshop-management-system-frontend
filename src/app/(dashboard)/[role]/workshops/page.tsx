"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Plus, Eye, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/loading-skeleton";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  fetchWorkshops,
  deleteWorkshop,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getCategoryName,
  getLevelName,
  getCreatorName,
} from "@/lib/api/services";
import type { IWorkshop } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function WorkshopsPage({ params }: PageProps) {
  const router = useRouter();
  const { role: dashboardRole } = React.use(params);
  const queryClient = useQueryClient();

  // Search/Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Dialogs state
  const [viewWorkshop, setViewWorkshop] = useState<IWorkshop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IWorkshop | null>(null);

  // ── Queries ───────────────────────────────────────────────────────

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: levels = [] } = useQuery({
    queryKey: ["levels"],
    queryFn: fetchWorkshopLevels,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workshopsData, isLoading } = useQuery({
    queryKey: ["workshops", { page, limit, searchTerm }],
    queryFn: () => fetchWorkshops({ page, limit, searchTerm }),
    enabled: !!dashboardRole,
  });

  const meta = workshopsData?.meta;
  const totalPages = meta?.totalPage || 1;
  const total = meta?.total || 0;

  // Enrich workshops with category/level names
  const workshops = React.useMemo(() => {
    const raw = workshopsData?.data || [];
    return enrichWorkshops(raw, categories, levels);
  }, [workshopsData, categories, levels]);

  // ── Mutations ─────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkshop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      setDeleteTarget(null);
      toast.success("Workshop deleted successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete workshop");
    },
  });

  // ── Debounce search ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setInputValue(value);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id);
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Workshop Management"
          description="Create and manage your workshops across the platform."
        >
          <Button
            onClick={() => router.push(`/${dashboardRole}/workshops/create`)}
            className="rounded-xl shadow-sm"
          >
            <Plus className="mr-2 size-4" />
            Create Workshop
          </Button>
        </PageHeader>

        {/* ── Search & Filters ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-70">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search workshops..."
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-surface-1 border-border focus:ring-primary/20 h-11 rounded-xl pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-surface-1 h-11 w-full rounded-xl sm:w-45">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            {total} <span className="font-normal">workshops found</span>
          </p>
        </div>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <Table>
          <TableHeader className="bg-surface-2">
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead className="w-20 py-4">Image</TableHead>
              <TableHead className="py-4">Workshop Details</TableHead>
              <TableHead className="py-4">Category</TableHead>
              <TableHead className="py-4">Level</TableHead>
              <TableHead className="py-4 text-right">Price</TableHead>
              <TableHead className="py-4">Capacity</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4">Created</TableHead>
              <TableHead className="w-30 py-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="p-4">
                  <TableSkeleton rows={5} columns={9} />
                </TableCell>
              </TableRow>
            ) : workshops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <p className="text-muted-foreground text-sm">
                    {searchTerm ? "No workshops match your search." : "No workshops found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              workshops
                .filter((ws: IWorkshop) => {
                  if (statusFilter === "all") return true;
                  const isPublished = ws.currentEnrollments > 0 || ws.price === 0;
                  return statusFilter === "published" ? isPublished : !isPublished;
                })
                .map((ws: IWorkshop) => {
                  const enrollmentRate = (ws.currentEnrollments / (ws.maxSeats || 1)) * 100;
                  const isFull = (ws.currentEnrollments || 0) >= (ws.maxSeats || 0);

                  return (
                    <TableRow key={ws._id} className="group hover:bg-surface-2 transition-colors">
                      <TableCell>
                        <div className="border-border bg-surface-3 relative h-10 w-13 shrink-0 overflow-hidden rounded-md border">
                          {ws.images && ws.images.length > 0 ? (
                            <Image
                              src={ws.images[0]}
                              alt={ws.title}
                              fill
                              sizes="52px"
                              className="object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-muted-foreground flex size-full items-center justify-center text-[8px] font-bold tracking-tighter uppercase">
                              No Img
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-display text-foreground max-w-50 truncate text-[15px] font-semibold">
                            {ws.title}
                          </span>
                          <span className="text-muted-foreground text-[12px] font-medium">
                            /{ws.slug || ws._id.slice(-6)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-accent-subtle bg-accent-subtle/10 text-accent rounded-full px-2 text-[10px] font-bold"
                        >
                          {getCategoryName(ws.category) || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary-subtle bg-primary-subtle/10 text-primary rounded-full px-2 text-[10px] font-bold"
                        >
                          {getLevelName(ws.level) || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-display text-foreground text-[16px] font-bold">
                          {ws.price != null && ws.price > 0 ? formatCurrency(ws.price) : "Free"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-25 flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={isFull ? "text-destructive" : "text-foreground"}>
                              {ws.currentEnrollments || 0}/{ws.maxSeats || "∞"}
                            </span>
                            {isFull && (
                              <span className="text-destructive text-[9px] uppercase">Full</span>
                            )}
                          </div>
                          {ws.maxSeats && (
                            <div className="bg-surface-3 h-1.5 w-full overflow-hidden rounded-full">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  isFull ? "bg-destructive" : "bg-primary"
                                )}
                                style={{
                                  width: `${Math.min(enrollmentRate, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            ws.currentEnrollments > 0 || ws.price === 0 ? "Published" : "Draft"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-default text-xs font-medium underline decoration-dotted underline-offset-4">
                              {formatDate(ws.createdAt)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-[10px] font-bold">
                              Full Date: {new Date(ws.createdAt).toLocaleString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <WorkshopActions
                          workshop={ws}
                          role={dashboardRole}
                          onView={() => setViewWorkshop(ws)}
                          onEdit={() => router.push(`/${dashboardRole}/workshops/${ws._id}/edit`)}
                          onDelete={() => setDeleteTarget(ws)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>

        {/* ── Server Pagination ──────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── View Workshop Dialog ───────────────────────────────────── */}
        <Dialog open={!!viewWorkshop} onOpenChange={() => setViewWorkshop(null)}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewWorkshop?.title}</DialogTitle>
              <DialogDescription>Workshop details</DialogDescription>
            </DialogHeader>
            {viewWorkshop && (
              <div className="space-y-4">
                {/* Images */}
                {viewWorkshop.images && viewWorkshop.images.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {viewWorkshop.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative h-32 w-48 shrink-0 overflow-hidden rounded-md"
                      >
                        <Image
                          src={img}
                          alt={`${viewWorkshop.title} ${i + 1}`}
                          fill
                          sizes="192px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted text-muted-foreground relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
                    No images available
                  </div>
                )}

                {viewWorkshop.description && (
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {viewWorkshop.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{getCategoryName(viewWorkshop.category) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium">{getLevelName(viewWorkshop.level) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {viewWorkshop.price != null ? formatCurrency(viewWorkshop.price) : "Free"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{viewWorkshop.location || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Seats</p>
                    <p className="font-medium">
                      {viewWorkshop.maxSeats
                        ? `${viewWorkshop.currentEnrollments} / ${viewWorkshop.maxSeats}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Age</p>
                    <p className="font-medium">{viewWorkshop.minAge || "—"}</p>
                  </div>
                  {viewWorkshop.startDate && (
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(viewWorkshop.startDate)}</p>
                    </div>
                  )}
                  {viewWorkshop.endDate && (
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(viewWorkshop.endDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Created By</p>
                    <p className="font-medium">{getCreatorName(viewWorkshop.createdBy) || "—"}</p>
                  </div>
                </div>

                {/* Lists */}
                {viewWorkshop.whatYouLearn.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">What You&apos;ll Learn</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                      {viewWorkshop.whatYouLearn.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewWorkshop.prerequisites.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Prerequisites</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                      {viewWorkshop.prerequisites.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewWorkshop.benefits.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Benefits</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                      {viewWorkshop.benefits.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewWorkshop.syllabus.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Syllabus</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                      {viewWorkshop.syllabus.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ─────────────────────────────────────────── */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Workshop"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
          variant="destructive"
          confirmLabel="Delete Workshop"
        />
      </div>
    </TooltipProvider>
  );
}

// ─── Workshop Actions ─────────────────────────────────────────────────

function WorkshopActions({
  onView,
  onEdit,
  onDelete,
}: {
  workshop: IWorkshop;
  role: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onView}
            className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg transition-colors"
          >
            <Eye className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[10px] font-bold">View Details</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="hover:bg-success/10 hover:text-success size-8 rounded-lg transition-colors"
          >
            <Pencil className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[10px] font-bold">Edit Workshop</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="hover:bg-destructive/10 hover:text-destructive size-8 rounded-lg transition-colors"
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[10px] font-bold">Delete Workshop</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
