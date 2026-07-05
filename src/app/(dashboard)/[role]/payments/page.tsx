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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

import { formatCurrency, formatDate, truncate } from "@/lib/formatters";
import { getAllEnrollments, getMyEnrollments, refundPayment, getInvoice } from "@/lib/api/services";
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
    <div className="group border-border bg-surface-1 hover:shadow-float relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 sm:flex-row">
      {/* Thumbnail */}
      <div className="border-border bg-surface-2 relative h-14 w-18 shrink-0 overflow-hidden rounded-xl border">
        {payment.workshopThumbnail ? (
          <Image
            src={payment.workshopThumbnail}
            alt={payment.workshopTitle}
            fill
            sizes="72px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="text-foreground-disabled size-5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/workshops/${payment.workshopSlug || payment.workshopId}`}
          className="font-display text-foreground hover:text-primary block truncate text-[15px] font-bold transition-colors"
        >
          {payment.workshopTitle}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-foreground-muted font-mono text-[12px]">
            TXN: {payment.transactionId}
          </span>
          <span className="bg-border size-1 rounded-full" />
          <span className="text-foreground-muted text-[13px]">{formatDate(payment.createdAt)}</span>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
        <div className="flex flex-col items-start sm:items-end">
          <span className="font-display text-foreground text-xl font-bold">
            {formatCurrency(payment.amount)}
          </span>
          <StatusBadge status={payment.status} className="mt-1" dot />
        </div>

        <div className="flex items-center gap-2">
          {isPaid && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/5 h-8 rounded-lg px-3 text-[13px] font-semibold"
              onClick={() => onDownload(payment.paymentId)}
            >
              <Download className="mr-2 size-3.5" />
              Invoice
            </Button>
          )}
          {isUnpaid && (
            <Link
              href={`/workshops/${payment.workshopSlug || payment.workshopId}`}
              className="text-warning flex items-center text-[13px] font-bold hover:underline"
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
    enabled: role?.toUpperCase() === "STUDENT",
  });

  const allStudentPayments = useMemo(
    () => extractPayments(studentEnrollments),
    [studentEnrollments]
  );

  const filteredPayments = useMemo(() => {
    let result = allStudentPayments;
    if (activeTab !== "all") {
      result = result.filter((p) => p.status.toUpperCase() === activeTab.toUpperCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.workshopTitle.toLowerCase().includes(q) || p.transactionId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allStudentPayments, activeTab, searchQuery]);

  const countAll = allStudentPayments.length;
  const countPaid = allStudentPayments.filter((p) => p.status.toUpperCase() === "PAID").length;
  const countUnpaid = allStudentPayments.filter((p) => p.status.toUpperCase() === "UNPAID").length;
  const countFailed = allStudentPayments.filter((p) => p.status.toUpperCase() === "FAILED").length;

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
    if (!role || role.toUpperCase() === "STUDENT") return;
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
      toast.error(err instanceof Error ? err.message : "Failed to refund payment");
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

  if (role?.toUpperCase() === "STUDENT") {
    return (
      <TooltipProvider>
        <div className="space-y-8">
          <div className="space-y-2">
            <PageHeader
              title="My Payments"
              description="Review your transaction history and download invoices."
            />
          </div>

          <div className="bg-surface-1 border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-surface-2 h-10 p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-4 text-xs font-bold tracking-wider uppercase"
                >
                  All <span className="text-foreground-disabled ml-2">{countAll}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="PAID"
                  className="rounded-lg px-4 text-xs font-bold tracking-wider uppercase"
                >
                  Paid <span className="text-success/60 ml-2">{countPaid}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="UNPAID"
                  className="rounded-lg px-4 text-xs font-bold tracking-wider uppercase"
                >
                  Unpaid <span className="text-warning/60 ml-2">{countUnpaid}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="FAILED"
                  className="rounded-lg px-4 text-xs font-bold tracking-wider uppercase"
                >
                  Failed <span className="text-danger/60 ml-2">{countFailed}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="text-foreground-disabled absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search payments..."
                className="bg-surface-2 focus:border-primary/20 h-10 rounded-xl border-transparent pl-9 transition-all"
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
                  className="bg-surface-1 border-border h-32 animate-pulse rounded-2xl border"
                />
              ))}
            </div>
          ) : studentError ? (
            <div className="border-danger/20 bg-danger/5 rounded-3xl border border-dashed py-16 text-center">
              <div className="bg-danger/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
                <XCircle className="text-danger size-7" />
              </div>
              <h3 className="text-foreground text-lg font-bold">Failed to load payments</h3>
              <p className="text-foreground-muted mx-auto mt-1 max-w-xs text-sm">
                {studentFetchError?.message ||
                  "Something went wrong while retrieving your history."}
              </p>
              <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
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
                <div className="border-border bg-surface-1/50 rounded-3xl border border-dashed py-20 text-center">
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
          <PageHeader
            title="Payment Management"
            description="Monitor transactions, issue refunds, and manage invoices across the platform."
          />
        </div>

        <div className="border-border bg-surface-1 overflow-hidden rounded-3xl border shadow-sm">
          {/* Toolbar */}
          <div className="bg-surface-2/50 border-bottom border-border flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search className="text-foreground-disabled absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search student or TXN..."
                className="bg-surface-1 border-border focus:ring-primary/20 h-11 rounded-xl pl-10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <p className="text-foreground-muted text-sm font-medium">{payments.length} results</p>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-surface-2/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground-muted h-12 px-6 text-[11px] font-bold tracking-wider uppercase">
                  Transaction ID
                </TableHead>
                <TableHead className="text-foreground-muted h-12 px-6 text-[11px] font-bold tracking-wider uppercase">
                  Student & Workshop
                </TableHead>
                <TableHead className="text-foreground-muted h-12 px-6 text-[11px] font-bold tracking-wider uppercase">
                  Amount
                </TableHead>
                <TableHead className="text-foreground-muted h-12 px-6 text-[11px] font-bold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="text-foreground-muted h-12 px-6 text-[11px] font-bold tracking-wider uppercase">
                  Date
                </TableHead>
                <TableHead className="text-foreground-muted h-12 px-6 text-right text-[11px] font-bold tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={6} className="p-6">
                      <div className="bg-surface-2 h-6 animate-pulse rounded-lg" />
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
                      <span className="text-foreground font-mono text-xs font-medium">
                        {truncate(payment.transactionId, 16)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="text-foreground text-sm font-bold">{payment.studentName}</p>
                        <p className="text-foreground-muted mt-0.5 max-w-48 truncate text-xs">
                          {payment.workshopTitle}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-display text-foreground text-sm font-bold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={payment.status} dot />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-foreground-muted text-sm">
                        {formatDate(payment.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="View invoice"
                              className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg"
                              onClick={() => handleViewInvoice(payment.paymentId)}
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
                                aria-label="Issue refund"
                                className="hover:bg-danger/10 hover:text-danger size-8 rounded-lg"
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
                            <Button variant="ghost" size="icon-xs" aria-label="Payment actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleViewInvoice(payment.paymentId)}>
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="bg-surface-2/20 border-border flex flex-col items-center justify-between gap-4 border-t p-5 sm:flex-row">
              <p className="text-foreground-muted text-sm font-medium">
                Showing Page <span className="text-foreground">{page}</span> of{" "}
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

        {/* ── Refund Dialog ──────────────────────────────────────────── */}
        <Dialog open={!!refundTarget} onOpenChange={() => setRefundTarget(null)}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <div className="bg-danger/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <RotateCcw className="text-danger size-6" />
              </div>
              <DialogTitle className="text-xl font-bold">Refund Payment</DialogTitle>
              <DialogDescription className="text-foreground-muted pt-1">
                You are about to issue a full refund for this transaction. This action is permanent.
              </DialogDescription>
            </DialogHeader>
            {refundTarget && (
              <div className="space-y-5 py-2">
                <div className="bg-surface-2 border-border grid grid-cols-2 gap-4 rounded-2xl border p-4">
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Student
                    </p>
                    <p className="truncate text-sm font-bold">{refundTarget.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Amount
                    </p>
                    <p className="text-foreground text-sm font-bold">
                      {formatCurrency(refundTarget.amount)}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-foreground-disabled text-[11px] font-bold tracking-wider uppercase">
                      Transaction ID
                    </p>
                    <p className="text-foreground truncate font-mono text-xs">
                      {refundTarget.transactionId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund-reason" className="ml-1 text-sm font-bold">
                    Reason for Refund
                  </Label>
                  <Textarea
                    id="refund-reason"
                    placeholder="e.g., Workshop cancelled, technical issues..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="bg-surface-1 border-border focus:ring-danger/20 min-h-24 rounded-2xl"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="mt-2 gap-2 sm:gap-0">
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
              <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <FileText className="text-primary size-6" />
              </div>
              <DialogTitle className="text-xl font-bold">Transaction Invoice</DialogTitle>
              <DialogDescription>
                View or print the official invoice for this transaction.
              </DialogDescription>
            </DialogHeader>
            {loadingInvoice ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-10">
                <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-foreground-muted animate-pulse text-sm font-medium">
                  Generating invoice...
                </p>
              </div>
            ) : invoiceUrl ? (
              <div className="space-y-5 py-2">
                <div className="bg-surface-2 border-border flex items-center justify-between rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-1 border-border flex size-10 items-center justify-center rounded-xl border">
                      <Printer className="text-foreground-muted size-5" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-bold">Invoice Document</p>
                      <p className="text-foreground-muted text-xs">PDF format (0.4 MB)</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open invoice in new tab"
                    asChild
                    className="rounded-xl"
                  >
                    <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-5" />
                    </a>
                  </Button>
                </div>
                <Button
                  asChild
                  className="shadow-raised hover:shadow-float h-12 w-full rounded-2xl text-base font-bold transition-all"
                >
                  <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 size-5" />
                    Download PDF
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-surface-2 mb-4 flex size-14 items-center justify-center rounded-full">
                  <XCircle className="text-foreground-disabled size-7" />
                </div>
                <p className="text-foreground-muted max-w-xs text-sm font-medium">
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
