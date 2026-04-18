"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  TableSkeleton,
} from "@/components/shared";
import { formatCurrency, formatDate } from "@/lib/formatters";
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
      toast.error(
        err instanceof Error ? err.message : "Failed to delete workshop",
      );
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
    <div className="space-y-6">
      <PageHeader
        title="Workshop Management"
        description="Manage all workshops"
      >
        <Button
          onClick={() => router.push(`/${dashboardRole}/workshops/create`)}
        >
          <Plus className="size-4" />
          Create Workshop
        </Button>
      </PageHeader>

      {/* ── Search & Info ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">{total} workshops total</p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-17.5">Actions</TableHead>
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
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "No workshops match your search."
                      : "No workshops found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              workshops.map((ws: IWorkshop) => {
                const availableSeats =
                  (ws.maxSeats ?? 0) - (ws.currentEnrollments || 0);
                return (
                  <TableRow key={ws._id}>
                    <TableCell>
                      <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                        {ws.images && ws.images.length > 0 ? (
                          <Image
                            src={ws.images[0]}
                            alt={ws.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="truncate text-sm font-medium max-w-50">
                        {ws.title}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
                      >
                        {getCategoryName(ws.category) || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                      >
                        {getLevelName(ws.level) || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {ws.price != null ? formatCurrency(ws.price) : "Free"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm ${availableSeats <= 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                      >
                        {ws.maxSeats
                          ? `${availableSeats} / ${ws.maxSeats}`
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          ws.currentEnrollments > 0 || ws.price === 0
                            ? "Published"
                            : "Draft"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(ws.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <WorkshopActions
                        workshop={ws}
                        role={dashboardRole}
                        onView={() => setViewWorkshop(ws)}
                        onEdit={() =>
                          router.push(
                            `/${dashboardRole}/workshops/${ws._id}/edit`,
                          )
                        }
                        onDelete={() => setDeleteTarget(ws)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Server Pagination ──────────────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
                  No images available
                </div>
              )}

              {viewWorkshop.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewWorkshop.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {getCategoryName(viewWorkshop.category) || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">
                    {getLevelName(viewWorkshop.level) || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {viewWorkshop.price != null
                      ? formatCurrency(viewWorkshop.price)
                      : "Free"}
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
                    <p className="font-medium">
                      {formatDate(viewWorkshop.startDate)}
                    </p>
                  </div>
                )}
                {viewWorkshop.endDate && (
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {formatDate(viewWorkshop.endDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <p className="font-medium">
                    {getCreatorName(viewWorkshop.createdBy) || "—"}
                  </p>
                </div>
              </div>

              {/* Lists */}
              {viewWorkshop.whatYouLearn.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">
                    What You&apos;ll Learn
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {viewWorkshop.whatYouLearn.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewWorkshop.prerequisites.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Prerequisites</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {viewWorkshop.prerequisites.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewWorkshop.benefits.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Benefits</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {viewWorkshop.benefits.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewWorkshop.syllabus.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Syllabus</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
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
  );
}

// ─── Workshop Actions ─────────────────────────────────────────────────

function WorkshopActions({
  role,
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
  // role is used by consumers; keep the prop but avoid lint warnings
  void role;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
