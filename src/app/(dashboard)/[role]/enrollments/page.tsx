"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
  XCircle,
  CalendarDays,
  Users,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ConfirmDialog,
  TableSkeleton,
} from "@/components/shared";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  getAllEnrollments,
  getMyEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
} from "@/lib/api/services";
import type { IEnrollment, EnrollmentStatus } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Payment Status Badge ────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <span className="text-sm text-muted-foreground">—</span>;
  return <StatusBadge status={status} />;
}

// ═════════════════════════════════════════════════════════════════════
// STUDENT ENROLLMENT DETAIL DIALOG
// ═════════════════════════════════════════════════════════════════════

function StudentEnrollmentDetailDialog({
  enrollment,
  open,
  onOpenChange,
}: {
  enrollment: IEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!enrollment) return null;
  const w = enrollment.workshop;
  const p = enrollment.payment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enrollment Details</DialogTitle>
          <DialogDescription>
            Full details of your workshop enrollment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Workshop
            </h3>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-base">{w.title}</p>
                <StatusBadge status={enrollment.status} />
              </div>
              {w.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  <span>{w.location}</span>
                </div>
              )}
              {w.startDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <span>{formatDate(w.startDate)}</span>
                </div>
              )}
              {w.price != null && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(w.price)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Enrollment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Student Count</p>
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{enrollment.studentCount}</span>
                </div>
              </div>
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Enrolled On</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {formatDate(enrollment.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {p && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Payment
              </h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={p.status} />
                </div>
                {p.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Transaction ID
                    </span>
                    <span className="text-xs font-mono">{p.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <Separator />
          <div className="flex justify-end">
            <Link href={`/workshops/${w._id}`}>
              <Button variant="outline" size="sm">
                <BookOpenCheck className="size-4 mr-1.5" />
                View Workshop
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function EnrollmentsPage({ params }: PageProps) {
  const { role } = React.use(params);

  // ── Admin/Instructor state ───────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewEnrollment, setViewEnrollment] = useState<IEnrollment | null>(
    null,
  );
  const [statusTarget, setStatusTarget] = useState<IEnrollment | null>(null);
  const [newStatus, setNewStatus] = useState<EnrollmentStatus>("PENDING");
  const [deleteTarget, setDeleteTarget] = useState<IEnrollment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Student state ────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<IEnrollment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // STUDENT: React Query
  // ═══════════════════════════════════════════════════════════════════

  const {
    data: studentEnrollments = [],
    isLoading: studentLoading,
    isError: studentError,
    error: studentFetchError,
  } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
    enabled: role === "STUDENT",
  });

  const cancelMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      updateEnrollmentStatus(enrollmentId, "CANCEL"),
    onSuccess: () => {
      toast.success("Enrollment cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      setCancelOpen(false);
      setSelectedEnrollment(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel enrollment");
    },
  });

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN/INSTRUCTOR: React Query
  // ═══════════════════════════════════════════════════════════════════

  const {
    data: adminEnrollmentsData,
    isLoading: adminLoading,
    refetch: refetchEnrollments,
  } = useQuery({
    queryKey: ["all-enrollments", page, limit],
    queryFn: () => getAllEnrollments({ page, limit }),
    enabled: !!role && role !== "STUDENT",
  });

  const enrollments = adminEnrollmentsData?.data || [];
  const totalPages = adminEnrollmentsData?.meta?.totalPage || 1;
  const total = adminEnrollmentsData?.meta?.total || 0;

  // ── Admin handlers ───────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    setUpdating(true);
    try {
      await updateEnrollmentStatus(statusTarget._id, newStatus);
      setStatusTarget(null);
      refetchEnrollments();
      toast.success("Enrollment status updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEnrollment(deleteTarget._id);
      setDeleteTarget(null);
      refetchEnrollments();
      toast.success("Enrollment deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete enrollment",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Student handlers ─────────────────────────────────────────────

  function handleViewDetails(enrollment: IEnrollment) {
    setSelectedEnrollment(enrollment);
    setDetailOpen(true);
  }

  function handleCancelEnrollment() {
    if (!selectedEnrollment) return;
    cancelMutation.mutate(selectedEnrollment._id);
  }

  function openCancelConfirm(enrollment: IEnrollment) {
    setSelectedEnrollment(enrollment);
    setCancelOpen(true);
  }

  function isCancelable(status: EnrollmentStatus): boolean {
    return status === "PENDING" || status === "COMPLETE";
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: STUDENT VIEW
  // ═══════════════════════════════════════════════════════════════════

  if (role === "STUDENT") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Enrollments"
          description="Track your workshop enrollments"
        />

        {studentLoading ? (
          <div className="rounded-lg border p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : studentError ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-3">
              <XCircle className="size-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Failed to load enrollments
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {studentFetchError?.message || "Please try again later."}
            </p>
          </div>
        ) : studentEnrollments.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title="No enrollments yet"
            description="You haven't enrolled in any workshops yet. Browse available workshops to get started."
            action={{
              label: "Browse Workshops",
              onClick: () => {
                window.location.href = "/workshops";
              },
            }}
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-22.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentEnrollments.map((enrollment) => {
                  const canCancel = isCancelable(enrollment.status);
                  return (
                    <TableRow key={enrollment._id}>
                      <TableCell>
                        <Link
                          href={`/workshops/${enrollment.workshop._id}`}
                          className="font-medium text-primary hover:underline text-sm"
                        >
                          {enrollment.workshop.title}
                        </Link>
                        {enrollment.workshop.location && (
                          <p className="text-xs text-muted-foreground truncate max-w-50">
                            {enrollment.workshop.location}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="text-sm">
                            {enrollment.studentCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(enrollment.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {enrollment.payment ? (
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={enrollment.payment.status} />
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(enrollment.payment.amount)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleViewDetails(enrollment)}
                            aria-label="View details"
                          >
                            <Eye className="size-4" />
                          </Button>
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openCancelConfirm(enrollment)}
                              aria-label="Cancel enrollment"
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Student detail dialog */}
        <StudentEnrollmentDetailDialog
          enrollment={selectedEnrollment}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />

        {/* Student cancel confirm dialog */}
        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancel Enrollment"
          description={`Are you sure you want to cancel your enrollment in "${selectedEnrollment?.workshop.title ?? ""}"? This action cannot be undone.`}
          onConfirm={handleCancelEnrollment}
          isLoading={cancelMutation.isPending}
          variant="destructive"
          confirmLabel="Cancel Enrollment"
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: ADMIN / INSTRUCTOR VIEW
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Management"
        description="View and manage workshop enrollments"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} enrollments total
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Workshop Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-17.5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-4">
                  <TableSkeleton rows={5} columns={7} />
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <p className="text-sm text-muted-foreground">
                    No enrollments found.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment._id}>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {enrollment.user?.name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.user?.email || ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="truncate text-sm max-w-50">
                      {enrollment.workshop?.title || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={enrollment.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{enrollment.studentCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(enrollment.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={enrollment.payment?.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setViewEnrollment(enrollment)}
                        >
                          <Eye className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setStatusTarget(enrollment);
                            setNewStatus(enrollment.status);
                          }}
                        >
                          <Pencil className="size-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(enrollment)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!adminLoading && totalPages > 1 && (
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

      {/* ── View Enrollment Dialog ─────────────────────────────────── */}
      <Dialog
        open={!!viewEnrollment}
        onOpenChange={() => setViewEnrollment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              Viewing enrollment information
            </DialogDescription>
          </DialogHeader>
          {viewEnrollment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">
                    {viewEnrollment.user?.name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {viewEnrollment.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Workshop</p>
                  <p className="font-medium">
                    {viewEnrollment.workshop?.title || "—"}
                  </p>
                  {viewEnrollment.workshop?.location && (
                    <p className="text-xs text-muted-foreground">
                      {viewEnrollment.workshop.location}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={viewEnrollment.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Student Count</p>
                  <p className="font-medium">{viewEnrollment.studentCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <PaymentStatusBadge status={viewEnrollment.payment?.status} />
                </div>
                {viewEnrollment.payment && (
                  <div>
                    <p className="text-muted-foreground">Payment Amount</p>
                    <p className="font-medium">
                      {formatCurrency(viewEnrollment.payment.amount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Enrolled On</p>
                  <p className="font-medium">
                    {formatDate(viewEnrollment.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Update Status Dialog ───────────────────────────────────── */}
      <Dialog open={!!statusTarget} onOpenChange={() => setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Enrollment Status</DialogTitle>
            <DialogDescription>
              Change status for enrollment by {statusTarget?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workshop</Label>
              <p className="text-sm">{statusTarget?.workshop?.title}</p>
            </div>
            <div className="space-y-2">
              <Label>Current Status</Label>
              <StatusBadge status={statusTarget?.status || "PENDING"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as EnrollmentStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETE">Complete</SelectItem>
                  <SelectItem value="CANCEL">Cancel</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusTarget(null)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Enrollment"
        description={`Are you sure you want to delete the enrollment for "${deleteTarget?.user?.name}" in "${deleteTarget?.workshop?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleting}
        variant="destructive"
        confirmLabel="Delete Enrollment"
      />
    </div>
  );
}
