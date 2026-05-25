"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  MoreHorizontal,
  FileText,
  RotateCcw,
  ExternalLink,
  Eye,
  Download,
  CreditCard,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Printer,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { formatCurrency, formatDate, truncate } from "@/lib/formatters";
import {
  getAllEnrollments,
  getMyEnrollments,
  refundPayment,
  getInvoice,
} from "@/lib/api/services";
import type { IEnrollment } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Payment row derived from enrollment ─────────────────────────────

interface PaymentRow {
  paymentId: string;
  enrollmentId: string;
  transactionId: string;
  studentName: string;
  workshopTitle: string;
  workshopId: string;
  workshopSlug: string;
  workshopThumbnail?: string;
  amount: number;
  status: string;
  createdAt: string;
  hasInvoice: boolean;
}

function extractPayments(enrollments: IEnrollment[]): PaymentRow[] {
  return enrollments
    .filter((e) => e.payment)
    .map((e) => ({
      paymentId: e.payment!._id,
      enrollmentId: e._id,
      transactionId: e.payment!.transactionId || "—",
      studentName: e.user?.name || "—",
      workshopTitle: e.workshop?.title || "—",
      workshopId: e.workshop?._id || "",
      workshopSlug: e.workshop?.slug || "",
      workshopThumbnail: e.workshop?.images?.[0],
      amount: e.payment!.amount,
      status: e.payment!.status,
      createdAt: e.createdAt,
      hasInvoice: e.payment!.status === "PAID",
    }));
}

// ─── Payment Card (Student View) ─────────────────────────────────────

function PaymentCard({
  payment,
  onDownload,
}: {
  payment: PaymentRow;
  onDownload: (id: string) => void;
}) {
  const isPaid = payment.status.toUpperCase() === "PAID";
  const isUnpaid = payment.status.toUpperCase() === "UNPAID";

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border border-border bg-surface-1 transition-all duration-300 hover:shadow-float hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
        {payment.workshopThumbnail ? (
          <Image
            src={payment.workshopThumbnail}
            alt={payment.workshopTitle}
            fill
            sizes="72px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-5 text-foreground-disabled" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/workshops/${payment.workshopSlug || payment.workshopId}`}
          className="block font-display text-[15px] font-bold text-foreground hover:text-primary transition-colors truncate"
        >
          {payment.workshopTitle}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[12px] text-foreground-muted">
            TXN: {payment.transactionId}
          </span>
          <span className="size-1 rounded-full bg-border" />
          <span className="text-[13px] text-foreground-muted">
            {formatDate(payment.createdAt)}
          </span>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-start sm:items-end justify-between gap-3">
        <div className="flex flex-col items-start sm:items-end">
          <span className="font-display text-xl font-bold text-foreground">
            {formatCurrency(payment.amount)}
          </span>
          <StatusBadge status={payment.status} className="mt-1" dot />
        </div>

        <div className="flex items-center gap-2">
          {isPaid && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[13px] font-semibold text-primary hover:bg-primary/5 rounded-lg"
              onClick={() => onDownload(payment.paymentId)}
            >
              <Download className="mr-2 size-3.5" />
              Invoice
            </Button>
          )}
          {isUnpaid && (
            <Link
              href={`/workshops/${payment.workshopSlug || payment.workshopId}`}
              className="flex items-center text-[13px] font-bold text-warning hover:underline"
            >
              Complete Payment
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function PaymentsPage({ params }: PageProps) {
  const { role } = React.use(params);

  // ── Admin/Instructor state ───────────────────────────────────────
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [refundTarget, setRefundTarget] = useState<PaymentRow | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [invoiceTarget, setInvoiceTarget] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Student state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");

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

  const allStudentPayments = useMemo(
    () => extractPayments(studentEnrollments),
    [studentEnrollments],
  );

  const filteredPayments = useMemo(() => {
    let result = allStudentPayments;
    if (activeTab !== "all") {
      result = result.filter(
        (p) => p.status.toUpperCase() === activeTab.toUpperCase(),
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.workshopTitle.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allStudentPayments, activeTab, searchQuery]);

  const countAll = allStudentPayments.length;
  const countPaid = allStudentPayments.filter(
    (p) => p.status.toUpperCase() === "PAID",
  ).length;
  const countUnpaid = allStudentPayments.filter(
    (p) => p.status.toUpperCase() === "UNPAID",
  ).length;
  const countFailed = allStudentPayments.filter(
    (p) => p.status.toUpperCase() === "FAILED",
  ).length;

  async function handleDownloadInvoice(paymentId: string) {
    try {
      const { invoiceUrl: url } = await getInvoice(paymentId);
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(`/payment/invoice/${paymentId}`, "_blank");
      }
    } catch {
      window.open(`/payment/invoice/${paymentId}`, "_blank");
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN/INSTRUCTOR: useEffect data fetching
  // ═══════════════════════════════════════════════════════════════════

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllEnrollments({ page, limit });
      const rows = extractPayments(res.data);
      setPayments(rows);
      setTotalPages(res.meta.totalPage);
      setTotal(res.meta.total);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (!role || role === "STUDENT") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [role, fetchData]);

  // ── Admin handlers ───────────────────────────────────────────────

  const handleRefund = async () => {
    if (!refundTarget || !refundReason.trim()) {
      toast.error("Please provide a refund reason");
      return;
    }
    setRefunding(true);
    try {
      await refundPayment(refundTarget.paymentId, refundReason.trim());
      setRefundTarget(null);
      setRefundReason("");
      fetchData();
      toast.success("Payment refunded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to refund payment",
      );
    } finally {
      setRefunding(false);
    }
  };

  const handleViewInvoice = async (paymentId: string) => {
    setInvoiceTarget(paymentId);
    setLoadingInvoice(true);
    try {
      const res = await getInvoice(paymentId);
      setInvoiceUrl(res.invoiceUrl);
    } catch {
      toast.error("Failed to load invoice");
    } finally {
      setLoadingInvoice(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: STUDENT VIEW
  // ═══════════════════════════════════════════════════════════════════

  if (role === "STUDENT") {
    return (
      <TooltipProvider>
        <div className="space-y-8">
          <div className="space-y-2">
            <Breadcrumbs />
            <PageHeader
              title="My Payments"
              description="Review your transaction history and download invoices."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-1 p-4 rounded-2xl border border-border">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-surface-2 h-10 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-4 text-xs font-bold uppercase tracking-wider"
                >
                  All{" "}
                  <span className="ml-2 text-foreground-disabled">
                    {countAll}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="PAID"
                  className="rounded-lg px-4 text-xs font-bold uppercase tracking-wider"
                >
                  Paid <span className="ml-2 text-success/60">{countPaid}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="UNPAID"
                  className="rounded-lg px-4 text-xs font-bold uppercase tracking-wider"
                >
                  Unpaid{" "}
                  <span className="ml-2 text-warning/60">{countUnpaid}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="FAILED"
                  className="rounded-lg px-4 text-xs font-bold uppercase tracking-wider"
                >
                  Failed{" "}
                  <span className="ml-2 text-danger/60">{countFailed}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-disabled" />
              <Input
                placeholder="Search payments..."
                className="pl-9 h-10 rounded-xl bg-surface-2 border-transparent focus:border-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {studentLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-surface-1 animate-pulse border border-border"
                />
              ))}
            </div>
          ) : studentError ? (
            <div className="rounded-3xl border border-dashed border-danger/20 bg-danger/5 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 mx-auto mb-4">
                <XCircle className="size-7 text-danger" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Failed to load payments
              </h3>
              <p className="text-sm text-foreground-muted mt-1 max-w-xs mx-auto">
                {studentFetchError?.message ||
                  "Something went wrong while retrieving your history."}
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : allStudentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Your transaction history is empty. Once you enroll in a workshop, your payment details will appear here."
            />
          ) : (
            <div className="grid gap-4">
              {filteredPayments.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-surface-1/50">
                  <p className="text-foreground-muted font-medium">
                    No transactions match your filters.
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <PaymentCard
                    key={payment.paymentId}
                    payment={payment}
                    onDownload={handleDownloadInvoice}
                  />
                ))
              )}
            </div>
          )}
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
          <Breadcrumbs />
          <PageHeader
            title="Payment Management"
            description="Monitor transactions, issue refunds, and manage invoices across the platform."
          />
        </div>

        <div className="rounded-3xl border border-border bg-surface-1 overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-surface-2/50 border-bottom border-border">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground-disabled" />
              <Input
                placeholder="Search student or TXN..."
                className="pl-10 h-11 rounded-xl bg-surface-1 border-border focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <p className="text-sm font-medium text-foreground-muted">
                {payments.length} results
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-2/30">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Transaction ID
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Student & Workshop
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Amount
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Date
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-foreground-muted text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell colSpan={6} className="p-6">
                        <div className="h-6 bg-surface-2 rounded-lg animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="There are no payment records matching your criteria."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.paymentId}
                      className="group border-border hover:bg-surface-2/40 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {truncate(payment.transactionId, 16)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {payment.studentName}
                          </p>
                          <p className="text-xs text-foreground-muted mt-0.5 truncate max-w-48">
                            {payment.workshopTitle}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="font-display text-sm font-bold text-foreground">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <StatusBadge status={payment.status} dot />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm text-foreground-muted">
                          {formatDate(payment.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                  handleViewInvoice(payment.paymentId)
                                }
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Invoice</TooltipContent>
                          </Tooltip>

                          {payment.status === "PAID" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="size-8 rounded-lg hover:bg-danger/10 hover:text-danger"
                                  onClick={() => {
                                    setRefundTarget(payment);
                                    setRefundReason("");
                                  }}
                                >
                                  <RotateCcw className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Issue Refund</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {/* Mobile action menu fallback */}
                        <div className="sm:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewInvoice(payment.paymentId)
                                }
                              >
                                <FileText className="mr-2 size-4" />
                                View Invoice
                              </DropdownMenuItem>
                              {payment.status === "PAID" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setRefundTarget(payment);
                                    setRefundReason("");
                                  }}
                                  className="text-danger focus:text-danger"
                                >
                                  <RotateCcw className="mr-2 size-4" />
                                  Refund
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-surface-2/20 border-t border-border">
              <p className="text-sm font-medium text-foreground-muted">
                Showing Page <span className="text-foreground">{page}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 px-4"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-2 size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 px-4"
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

        {/* ── Refund Dialog ──────────────────────────────────────────── */}
        <Dialog
          open={!!refundTarget}
          onOpenChange={() => setRefundTarget(null)}
        >
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <div className="size-12 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
                <RotateCcw className="size-6 text-danger" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Refund Payment
              </DialogTitle>
              <DialogDescription className="text-foreground-muted pt-1">
                You are about to issue a full refund for this transaction. This
                action is permanent.
              </DialogDescription>
            </DialogHeader>
            {refundTarget && (
              <div className="space-y-5 py-2">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-2 border border-border">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-disabled">
                      Student
                    </p>
                    <p className="text-sm font-bold truncate">
                      {refundTarget.studentName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-disabled">
                      Amount
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(refundTarget.amount)}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-disabled">
                      Transaction ID
                    </p>
                    <p className="font-mono text-xs text-foreground truncate">
                      {refundTarget.transactionId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="refund-reason"
                    className="text-sm font-bold ml-1"
                  >
                    Reason for Refund
                  </Label>
                  <Textarea
                    id="refund-reason"
                    placeholder="e.g., Workshop cancelled, technical issues..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="min-h-24 rounded-2xl bg-surface-1 border-border focus:ring-danger/20"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                variant="ghost"
                onClick={() => setRefundTarget(null)}
                disabled={refunding}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRefund}
                disabled={refunding || !refundReason.trim()}
                className="rounded-xl px-6"
              >
                {refunding ? "Processing..." : "Confirm Refund"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Invoice Dialog ─────────────────────────────────────────── */}
        <Dialog
          open={!!invoiceTarget}
          onOpenChange={() => {
            setInvoiceTarget(null);
            setInvoiceUrl(null);
          }}
        >
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="size-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Transaction Invoice
              </DialogTitle>
              <DialogDescription>
                View or print the official invoice for this transaction.
              </DialogDescription>
            </DialogHeader>
            {loadingInvoice ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-foreground-muted animate-pulse">
                  Generating invoice...
                </p>
              </div>
            ) : invoiceUrl ? (
              <div className="space-y-5 py-2">
                <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-surface-1 flex items-center justify-center border border-border">
                      <Printer className="size-5 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Invoice Document
                      </p>
                      <p className="text-xs text-foreground-muted">
                        PDF format (0.4 MB)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-xl"
                  >
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-5" />
                    </a>
                  </Button>
                </div>
                <Button
                  asChild
                  className="w-full h-12 rounded-2xl text-base font-bold shadow-raised hover:shadow-float transition-all"
                >
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 size-5" />
                    Download PDF
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-14 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                  <XCircle className="size-7 text-foreground-disabled" />
                </div>
                <p className="text-sm font-medium text-foreground-muted max-w-xs">
                  Invoice is currently unavailable for this transaction.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl"
                  onClick={() => setInvoiceTarget(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
