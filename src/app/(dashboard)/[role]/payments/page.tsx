"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  TableSkeleton,
} from "@/components/shared";
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
      amount: e.payment!.amount,
      status: e.payment!.status,
      createdAt: e.createdAt,
      hasInvoice: e.payment!.status === "PAID",
    }));
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function PaymentsPage({ params }: PageProps) {
  const [role, setRole] = useState<string>("");

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

  // ── Student state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

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
    [studentEnrollments]
  );

  const filteredPayments = useMemo(() => {
    if (activeTab === "all") return allStudentPayments;
    return allStudentPayments.filter(
      (p) => p.status.toUpperCase() === activeTab.toUpperCase()
    );
  }, [allStudentPayments, activeTab]);

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
    if (!role || role === "STUDENT") return;
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

  if (role === "STUDENT") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Payments"
          description="View your payment history"
        />

        {studentLoading ? (
          <div className="space-y-4">
            <div className="h-10">
              <TableSkeleton rows={1} columns={4} />
            </div>
            <div className="rounded-lg border p-4">
              <TableSkeleton rows={5} columns={6} />
            </div>
          </div>
        ) : studentError ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-3">
              <XCircle className="size-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Failed to load payments
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {studentFetchError?.message || "Please try again later."}
            </p>
          </div>
        ) : allStudentPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="You don't have any payment records. Payments will appear here after you enroll and pay for a workshop."
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                  {countAll}
                </span>
              </TabsTrigger>
              <TabsTrigger value="PAID">
                Paid
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold dark:bg-emerald-950/50 dark:text-emerald-400">
                  {countPaid}
                </span>
              </TabsTrigger>
              <TabsTrigger value="UNPAID">
                Unpaid
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-[10px] font-semibold dark:bg-orange-950/50 dark:text-orange-400">
                  {countUnpaid}
                </span>
              </TabsTrigger>
              <TabsTrigger value="FAILED">
                Failed
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-red-100 text-red-700 text-[10px] font-semibold dark:bg-red-950/50 dark:text-red-400">
                  {countFailed}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Workshop</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[90px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <p className="text-sm text-muted-foreground">
                            No payments found for this filter.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.paymentId}>
                          <TableCell>
                            <span className="font-mono text-xs">
                              {truncate(payment.transactionId, 16)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/workshops/${payment.workshopId}`}
                              className="font-medium text-primary hover:underline text-sm"
                            >
                              {payment.workshopTitle}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {formatCurrency(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={payment.status} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon-xs" asChild>
                                <Link
                                  href={`/payment/invoice/${payment.paymentId}`}
                                  aria-label="View invoice"
                                >
                                  <Eye className="size-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleDownloadInvoice(payment.paymentId)}
                                aria-label="Download invoice"
                              >
                                <Download className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: ADMIN / INSTRUCTOR VIEW
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Management" description="View and manage workshop payments" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{payments.length} payments on this page</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="p-4">
                  <TableSkeleton rows={5} columns={6} />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <p className="text-sm text-muted-foreground">No payments found.</p>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {truncate(payment.transactionId, 16)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">{payment.workshopTitle}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewInvoice(payment.paymentId)}>
                          <FileText className="size-4" />
                          View Invoice
                        </DropdownMenuItem>
                        {payment.status === "PAID" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setRefundTarget(payment);
                              setRefundReason("");
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <RotateCcw className="size-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      {/* ── Refund Dialog ──────────────────────────────────────────── */}
      <Dialog open={!!refundTarget} onOpenChange={() => setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Issue a refund for this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {refundTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">{refundTarget.studentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(refundTarget.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-xs">{refundTarget.transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={refundTarget.status} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-reason">Refund Reason *</Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Provide a reason for the refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)} disabled={refunding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRefund} disabled={refunding || !refundReason.trim()}>
              {refunding ? "Processing..." : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invoice Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!invoiceTarget} onOpenChange={() => { setInvoiceTarget(null); setInvoiceUrl(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Payment invoice details</DialogDescription>
          </DialogHeader>
          {loadingInvoice ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Loading invoice...</p>
            </div>
          ) : invoiceUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The invoice is ready. Click the button below to view it.
              </p>
              <Button asChild className="w-full">
                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Open Invoice
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Invoice not available for this payment.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
