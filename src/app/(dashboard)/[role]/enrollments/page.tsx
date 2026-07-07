"use client";

import React, { useMemo, useState } from "react";
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
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Search,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/loading-skeleton";

import { formatDate, formatCurrency } from "@/lib/formatters";
import { maskEmail } from "@/lib/utils/masking";
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
  if (!status) return <span className="text-foreground-disabled text-[12px] font-medium">—</span>;
  return <StatusBadge status={status} dot />;
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
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-none p-0 shadow-2xl">
        <div className="bg-primary relative h-32 overflow-hidden">
          <div className="from-primary via-primary-hover to-accent absolute inset-0 bg-linear-to-br opacity-90" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="absolute right-6 bottom-4 left-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/20 backdrop-blur-md">
                <BookOpenCheck className="size-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-white/70 uppercase">
                  Enrollment Details
                </p>
                <p className="max-w-48 truncate text-lg font-bold text-white">
                  ID: {enrollment._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <StatusBadge
              status={enrollment.status}
              className="border-none bg-white/20 text-white"
            />
          </div>
        </div>

        <div className="bg-surface-1 space-y-6 p-7">
          {/* Workshop Section */}
          <div className="space-y-3">
            <h3 className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
              Workshop Information
            </h3>
            <div className="border-border bg-surface-2 space-y-3 rounded-2xl border p-4">
              <p className="font-display text-foreground text-base leading-tight font-bold">
                {w.title}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {w.location && (
                  <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                    <MapPin className="text-primary size-3.5" />
                    <span className="truncate">{w.location}</span>
                  </div>
                )}
                {w.startDate && (
                  <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                    <CalendarDays className="text-primary size-3.5" />
                    <span>{formatDate(w.startDate)}</span>
                  </div>
                )}
                <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                  <Users className="text-primary size-3.5" />
                  <span>{enrollment.studentCount} Student(s)</span>
                </div>
                {w.price != null && (
                  <div className="text-foreground flex items-center gap-2 text-[13px] font-bold">
                    <span className="text-primary">৳</span>
                    <span>{formatCurrency(w.price).replace(/BDT|৳/g, "").trim()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          {p && (
            <div className="space-y-3">
              <h3 className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
                Payment Summary
              </h3>
              <div className="border-border bg-surface-2 space-y-3 rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-surface-1 border-border flex size-8 items-center justify-center rounded-lg border">
                      <CreditCard className="text-foreground-muted size-4" />
                    </div>
                    <div>
                      <p className="text-foreground text-[13px] font-bold">
                        {formatCurrency(p.amount)}
                      </p>
                      <p className="text-foreground-muted font-mono text-[11px] tracking-tighter uppercase">
                        TXN: {p.transactionId?.slice(-12) || "—"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} dot />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Link href={`/workshops/${w.slug || w._id}`} className="flex-1">
              <Button className="shadow-raised hover:shadow-float h-11 w-full rounded-xl font-bold transition-all">
                <Eye className="mr-2 size-4" />
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
  const [viewEnrollment, setViewEnrollment] = useState<IEnrollment | null>(null);
  const [statusTarget, setStatusTarget] = useState<IEnrollment | null>(null);
  const [newStatus, setNewStatus] = useState<EnrollmentStatus>("PENDING");
  const [deleteTarget, setDeleteTarget] = useState<IEnrollment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Student state ────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const [selectedEnrollment, setSelectedEnrollment] = useState<IEnrollment | null>(null);
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
    enabled: role?.toUpperCase() === "STUDENT",
  });

  const cancelMutation = useMutation({
    mutationFn: (enrollmentId: string) => updateEnrollmentStatus(enrollmentId, "CANCEL"),
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

  const filteredStudentEnrollments = useMemo(() => {
    if (!searchQuery) return studentEnrollments;
    const q = searchQuery.toLowerCase();
    return studentEnrollments.filter(
      (e) =>
        e.workshop.title.toLowerCase().includes(q) || e.workshop.location?.toLowerCase().includes(q)
    );
  }, [studentEnrollments, searchQuery]);

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
    enabled: !!role && role.toUpperCase() !== "STUDENT",
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
      toast.error(err instanceof Error ? err.message : "Failed to update status");
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
      toast.error(err instanceof Error ? err.message : "Failed to delete enrollment");
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
    return status === "PENDING";
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: STUDENT VIEW
  // ═══════════════════════════════════════════════════════════════════

  if (role?.toUpperCase() === "STUDENT") {
    return (
      <TooltipProvider>
        <div className="space-y-8">
          <div className="space-y-2">
            <PageHeader
              title="My Enrollments"
              description="Track your active workshops, check schedules, and manage your registrations."
            />
          </div>

          <div className="bg-surface-1 border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <BookOpenCheck className="text-primary size-5" />
              </div>
              <p className="text-foreground text-sm font-bold">
                {studentEnrollments.length}{" "}
                <span className="text-foreground-muted font-medium">Total Enrollments</span>
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="text-foreground-disabled absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search workshops..."
                className="bg-surface-2 focus:border-primary/20 h-10 rounded-xl border-transparent pl-9 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {studentLoading ? (
            <div className="border-border bg-surface-1 overflow-hidden rounded-3xl border p-1">
              <TableSkeleton rows={6} columns={6} />
            </div>
          ) : studentError ? (
            <div className="border-danger/20 bg-danger/5 rounded-3xl border border-dashed py-16 text-center">
              <div className="bg-danger/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
                <XCircle className="text-danger size-7" />
              </div>
              <h3 className="text-foreground text-lg font-bold">Failed to load enrollments</h3>
              <p className="text-foreground-muted mx-auto mt-1 max-w-xs text-sm">
                {studentFetchError?.message ||
                  "There was a problem retrieving your enrollment data."}
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : studentEnrollments.length === 0 ? (
            <EmptyState
              icon={BookOpenCheck}
              title="No enrollments yet"
              description="Ready to start learning? Explore our curated workshops and take the first step towards mastering new skills."
              action={{
                label: "Browse Workshops",
                onClick: () => {
                  window.location.href = "/workshops";
                },
              }}
            />
          ) : (
            <Table>
              <TableHeader className="bg-surface-2/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                    Workshop
                  </TableHead>
                  <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                    Seats
                  </TableHead>
                  <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                    Date
                  </TableHead>
                  <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                    Payment
                  </TableHead>
                  <TableHead className="text-foreground-muted px-6 py-4 text-right text-[11px] font-bold tracking-wider uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudentEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <p className="text-foreground-muted text-sm font-medium">
                        No enrollments match your search.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudentEnrollments.map((enrollment) => {
                    const canCancel = isCancelable(enrollment.status);
                    return (
                      <TableRow
                        key={enrollment._id}
                        className="group border-border hover:bg-surface-2/40 transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <Link
                              href={`/workshops/${enrollment.workshop?.slug || enrollment.workshop?._id || "#"}`}
                              className="font-display text-foreground hover:text-primary max-w-64 truncate text-[15px] font-bold transition-colors"
                            >
                              {enrollment.workshop.title}
                            </Link>
                            {enrollment.workshop.location && (
                              <div className="text-foreground-muted mt-1 flex items-center gap-1.5 text-[12px]">
                                <MapPin className="size-3" />
                                <span className="max-w-48 truncate">
                                  {enrollment.workshop.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <StatusBadge status={enrollment.status} dot />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <Users className="text-foreground-disabled size-3.5" />
                            {enrollment.studentCount}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-foreground-muted text-[13px]">
                            {formatDate(enrollment.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {enrollment.payment ? (
                            <div className="flex flex-col gap-1">
                              <StatusBadge
                                status={enrollment.payment.status}
                                dot
                                className="origin-left scale-90"
                              />
                              <span className="text-foreground-muted ml-1 text-[11px] font-bold">
                                {formatCurrency(enrollment.payment.amount)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-foreground-disabled text-xs font-medium">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label="View enrollment details"
                                  className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg"
                                  onClick={() => handleViewDetails(enrollment)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>

                            {canCancel && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label="Cancel enrollment"
                                    onClick={() => openCancelConfirm(enrollment)}
                                    className="hover:bg-danger/10 hover:text-danger size-8 rounded-lg"
                                  >
                                    <XCircle className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel Enrollment</TooltipContent>
                              </Tooltip>
                            )}

                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="View workshop"
                              className="size-8 rounded-lg"
                              asChild
                            >
                              <Link
                                href={`/workshops/${enrollment.workshop?.slug || enrollment.workshop?._id || "#"}`}
                              >
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
            description={`Are you sure you want to cancel your enrollment in "${selectedEnrollment?.workshop.title ?? ""}"? This action will mark your enrollment as cancelled.`}
            onConfirm={handleCancelEnrollment}
            isLoading={cancelMutation.isPending}
            variant="destructive"
            confirmLabel="Confirm Cancellation"
          />
        </div>
      </TooltipProvider>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: ADMIN / INSTRUCTOR VIEW
  // ═══════════════════════════════════════════════════════════════════

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-2">
          <PageHeader
            title="Enrollment Management"
            description="Manage global workshop registrations, update statuses, and monitor student participation."
          />
        </div>

        <div className="border-border bg-surface-1 overflow-hidden rounded-3xl border shadow-sm">
          {/* Toolbar */}
          <div className="bg-surface-2/50 border-bottom border-border flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="bg-surface-1 border-border flex size-10 items-center justify-center rounded-xl border">
                <Users className="text-foreground-muted size-5" />
              </div>
              <p className="text-foreground text-sm font-bold">
                {total} <span className="text-foreground-muted font-medium">Total Records</span>
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="text-foreground-disabled absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search student or workshop..."
                className="bg-surface-1 border-border focus:ring-primary/20 h-11 rounded-xl pl-10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader className="bg-surface-2/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Student
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Workshop
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Qty
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Date
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                  Payment
                </TableHead>
                <TableHead className="text-foreground-muted px-6 py-4 text-right text-[11px] font-bold tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={7} className="p-6">
                      <div className="bg-surface-2 h-8 animate-pulse rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <EmptyState
                      icon={BookOpenCheck}
                      title="No enrollments found"
                      description="There are no registration records currently available."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((enrollment) => (
                  <TableRow
                    key={enrollment._id}
                    className="group border-border hover:bg-surface-2/40 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary border-primary/5 flex size-9 items-center justify-center rounded-full border text-xs font-bold">
                          {enrollment.user?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-bold">
                            {enrollment.user?.name || "—"}
                          </p>
                          <p className="text-foreground-muted text-[11px] font-medium">
                            {maskEmail(enrollment.user?.email) || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-foreground max-w-48 truncate text-sm font-medium">
                        {enrollment.workshop?.title || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={enrollment.status} dot />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center sm:text-left">
                      <span className="text-foreground text-sm font-bold">
                        {enrollment.studentCount}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-foreground-muted text-[13px]">
                        {formatDate(enrollment.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <PaymentStatusBadge status={enrollment.payment?.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="View enrollment details"
                              className="hover:bg-primary/10 size-8 rounded-lg"
                              onClick={() => setViewEnrollment(enrollment)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Edit enrollment status"
                              className="hover:bg-accent/10 size-8 rounded-lg"
                              onClick={() => {
                                setStatusTarget(enrollment);
                                setNewStatus(enrollment.status);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Status</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Delete enrollment record"
                              className="hover:bg-danger/10 hover:text-danger size-8 rounded-lg"
                              onClick={() => setDeleteTarget(enrollment)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Record</TooltipContent>
                        </Tooltip>
                      </div>
                      {/* Mobile dropdown */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" aria-label="Enrollment actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewEnrollment(enrollment)}>
                              <Eye className="mr-2 size-4" />
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setStatusTarget(enrollment);
                                setNewStatus(enrollment.status);
                              }}
                            >
                              <Pencil className="mr-2 size-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(enrollment)}
                              className="text-danger"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!adminLoading && totalPages > 1 && (
            <div className="bg-surface-2/20 border-border flex flex-col items-center justify-between gap-4 border-t p-5 sm:flex-row">
              <p className="text-foreground-muted text-sm font-medium">
                Page <span className="text-foreground">{page}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl px-4"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-2 size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl px-4"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── View Enrollment Dialog ─────────────────────────────────── */}
        <Dialog open={!!viewEnrollment} onOpenChange={() => setViewEnrollment(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader className="mb-4">
              <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <ShieldCheck className="text-primary size-6" />
              </div>
              <DialogTitle className="text-xl font-bold">Enrollment Overview</DialogTitle>
              <DialogDescription>
                Detailed information for registration {viewEnrollment?._id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            {viewEnrollment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Student
                    </p>
                    <p className="text-foreground text-sm font-bold">
                      {viewEnrollment.user?.name || "—"}
                    </p>
                    <p className="text-foreground-muted text-xs">
                      {maskEmail(viewEnrollment.user?.email)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Workshop
                    </p>
                    <p className="text-foreground text-sm font-bold">
                      {viewEnrollment.workshop?.title || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Status
                    </p>
                    <StatusBadge status={viewEnrollment.status} dot />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Attendees
                    </p>
                    <p className="text-foreground text-sm font-bold">
                      {viewEnrollment.studentCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Payment
                    </p>
                    <PaymentStatusBadge status={viewEnrollment.payment?.status} />
                  </div>
                  {viewEnrollment.payment && (
                    <div className="space-y-1">
                      <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                        Amount
                      </p>
                      <p className="text-foreground text-sm font-bold">
                        {formatCurrency(viewEnrollment.payment.amount)}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Enrolled On
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {formatDate(viewEnrollment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setViewEnrollment(null)}
                  >
                    Dismiss
                  </Button>
                  <Link
                    href={`/workshops/${viewEnrollment.workshop?.slug || viewEnrollment.workshop?._id || "#"}`}
                    className="flex-1"
                  >
                    <Button className="w-full rounded-xl">View Workshop</Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Update Status Dialog ───────────────────────────────────── */}
        <Dialog open={!!statusTarget} onOpenChange={() => setStatusTarget(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader className="mb-4">
              <div className="bg-accent/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <Pencil className="text-accent-foreground size-5" />
              </div>
              <DialogTitle className="text-xl font-bold">Update Registration Status</DialogTitle>
              <DialogDescription>
                Modify the enrollment state for student {statusTarget?.user?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="border-border bg-surface-2 space-y-1 rounded-2xl border p-4">
                <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                  Workshop
                </p>
                <p className="text-foreground text-sm font-bold">{statusTarget?.workshop?.title}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status" className="ml-1 text-[13px] font-bold">
                  Select New Status
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as EnrollmentStatus)}
                >
                  <SelectTrigger
                    id="new-status"
                    className="bg-surface-1 border-border h-12 rounded-xl"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="PENDING">Pending Approval</SelectItem>
                    <SelectItem value="COMPLETE">Registration Complete</SelectItem>
                    <SelectItem value="CANCEL">Cancelled</SelectItem>
                    <SelectItem value="FAILED">Process Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setStatusTarget(null)}
                disabled={updating}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={updating} className="rounded-xl px-6">
                {updating ? "Processing..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ─────────────────────────────────────────── */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Registration Record"
          description={`Are you sure you want to permanently delete the enrollment for "${deleteTarget?.user?.name}" in "${deleteTarget?.workshop?.title}"? This will remove all associated history.`}
          onConfirm={handleDelete}
          isLoading={deleting}
          variant="destructive"
          confirmLabel="Delete Permanently"
        />
      </div>
    </TooltipProvider>
  );
}
