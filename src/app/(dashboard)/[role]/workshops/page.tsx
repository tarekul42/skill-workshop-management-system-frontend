"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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

import { PageHeader, StatusBadge, ConfirmDialog, TableSkeleton } from "@/components/shared";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { fetchWorkshops, deleteWorkshop } from "@/lib/api/services";
import type { IWorkshop } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function WorkshopsPage({ params }: PageProps) {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  // Data state
  const [workshops, setWorkshops] = useState<IWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialogs state
  const [viewWorkshop, setViewWorkshop] = useState<IWorkshop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IWorkshop | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

  // ── Fetch workshops ────────────────────────────────────────────────

  const fetchWorkshopData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWorkshops({ page, limit, searchTerm });
      setWorkshops(res.data);
      setTotalPages(res.meta.totalPage);
      setTotal(res.meta.total);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    if (!role) return;
    fetchWorkshopData();
  }, [role, fetchWorkshopData]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWorkshop(deleteTarget._id);
      setDeleteTarget(null);
      fetchWorkshopData();
    } catch {
      // Error handled silently
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="Workshop Management" description="Manage all workshops">
        <Button
          onClick={() => router.push(`/${role}/workshops/create`)}
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
            value={searchTerm}
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="p-4">
                  <TableSkeleton rows={5} columns={8} />
                </TableCell>
              </TableRow>
            ) : workshops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "No workshops match your search." : "No workshops found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              workshops.map((ws) => {
                const availableSeats = (ws.maxSeats ?? 0) - ws.currentEnrollments;
                return (
                  <TableRow key={ws._id}>
                    <TableCell>
                      <p className="truncate text-sm font-medium max-w-[200px]">{ws.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                        {ws.category?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                        {ws.level?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {ws.price != null ? formatCurrency(ws.price) : "Free"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${availableSeats <= 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {ws.maxSeats ? `${availableSeats} / ${ws.maxSeats}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={ws.currentEnrollments > 0 || ws.price === 0 ? "Published" : "Draft"}
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
                        role={role}
                        onView={() => setViewWorkshop(ws)}
                        onEdit={() => router.push(`/${role}/workshops/${ws._id}/edit`)}
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
      {!loading && totalPages > 1 && (
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
              {viewWorkshop.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {viewWorkshop.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${viewWorkshop.title} ${i + 1}`}
                      className="h-32 w-auto rounded-md object-cover"
                    />
                  ))}
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
                  <p className="font-medium">{viewWorkshop.category?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{viewWorkshop.level?.name || "—"}</p>
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
                  <p className="font-medium">{viewWorkshop.createdBy?.name || "—"}</p>
                </div>
              </div>

              {/* Lists */}
              {viewWorkshop.whatYouLearn.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">What You&apos;ll Learn</p>
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
        isLoading={deleting}
        variant="destructive"
        confirmLabel="Delete Workshop"
      />
    </div>
  );
}

// ─── Workshop Actions ─────────────────────────────────────────────────

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function WorkshopActions({
  role: _userRole,
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
  void _userRole;
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
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
