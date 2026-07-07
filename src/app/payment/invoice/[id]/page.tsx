"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Printer, ArrowLeft, ShieldCheck, Globe, Mail } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInvoice } from "@/lib/api/services";
import { ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { isValidUrl } from "@/lib/utils";
import { maskEmail, maskPhone } from "@/lib/utils/masking";

interface InvoicePageData {
  invoiceUrl?: string;
  payment?: {
    status?: string;
    amount?: number;
    createdAt?: string;
    transactionId?: string;
  };
  enrollment?: {
    studentCount?: number;
    workshop?: { title?: string };
    user?: { name?: string; email?: string; phone?: string };
  };
}

// ═════════════════════════════════════════════════════════════════════
// INVOICE PAGE
// ═════════════════════════════════════════════════════════════════════

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | string | null>(null);
  const [data, setData] = useState<InvoicePageData | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getInvoice(id as string);
        setData(res as InvoicePageData);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError("Failed to load invoice details.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-surface-2 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-foreground-muted animate-pulse text-sm font-bold">
            Retrieving invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    let title = "Unable to find invoice";
    let message =
      "We couldn&apos;t locate the invoice with the provided ID. Please check the transaction history in your dashboard.";

    if (error instanceof ApiError) {
      if (error.status === 404) {
        title = "Invoice Not Found";
        message = error.message || "The invoice with the provided ID does not exist.";
      } else if (error.status === 403 || error.status === 401) {
        title = "Access Denied";
        message =
          error.message ||
          "You do not have permission to view this invoice. Please ensure you are logged in with the correct account.";
      } else if (error.status === 0) {
        title = "Network Error";
        message =
          "Unable to connect to the server. Please check your internet connection and try again.";
      } else {
        title = `Error (${error.status})`;
        message = error.message || "An unexpected error occurred while fetching the invoice.";
      }
    } else if (typeof error === "string") {
      message = error;
    }

    return (
      <div className="bg-surface-2 flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="bg-danger/10 mx-auto flex size-16 items-center justify-center rounded-3xl">
            <ShieldCheck className="text-danger size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-foreground-muted">{message}</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <a href="/student/payments">
              <ArrowLeft className="mr-2 size-4" />
              Back to Payments
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Derived data for display
  const p = data.payment || {};
  const e = data.enrollment || {};
  const w = e.workshop || {};
  const u = e.user || {};

  return (
    <div className="w-full p-2 sm:p-0 print:bg-white print:p-0">
      {/* Top Bar (Hidden on print) */}
      <div className="mx-auto mb-6 flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row print:hidden">
        <Button
          variant="ghost"
          className="rounded-xl"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/student/payments");
            }
          }}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-11 rounded-xl px-5 font-bold"
          >
            <Printer className="mr-2 size-4" />
            Print Invoice
          </Button>
          {data.invoiceUrl && isValidUrl(data.invoiceUrl) && (
            <Button
              asChild
              className="shadow-raised hover:shadow-float h-11 rounded-xl px-5 font-bold"
            >
              <a href={data.invoiceUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 size-4" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Invoice Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl overflow-hidden rounded-4xl bg-white shadow-xl print:rounded-none print:shadow-none"
      >
        {/* Header Section */}
        <div className="from-primary to-primary-hover flex flex-col justify-between gap-8 bg-linear-to-r p-8 text-white sm:flex-row sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/20 backdrop-blur-md">
                <ShieldCheck className="size-7 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Invoice</h1>
            </div>
            <div className="space-y-1 text-sm font-medium opacity-80">
              <div className="flex items-center gap-2">
                <Globe className="size-3.5" /> swms.com
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5" /> support@swms.com
              </div>
            </div>
          </div>
          <div className="space-y-2 text-left sm:text-right">
            <div className="inline-block rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
              {p.status || "PAID"}
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold tracking-widest text-white/60 uppercase">
                Invoice Number
              </p>
              <p className="font-mono text-xl font-bold">
                #INV-{id?.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold tracking-widest text-white/60 uppercase">
                Date Issued
              </p>
              <p className="font-bold">{formatDate(p.createdAt ?? new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-12 p-8 sm:p-6">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-foreground-disabled border-border border-b pb-2 text-xs font-bold tracking-widest uppercase">
                Bill To
              </h3>
              <div className="space-y-1">
                <p className="text-foreground text-xl font-bold">{u.name || "—"}</p>
                <p className="text-foreground-subtle text-sm font-medium">{maskEmail(u.email)}</p>
                <p className="text-foreground-subtle text-sm">{maskPhone(u.phone)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-foreground-disabled border-border border-b pb-2 text-xs font-bold tracking-widest uppercase">
                Payment Info
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted font-medium">Transaction ID</span>
                  <span className="text-foreground font-mono font-bold">
                    {p.transactionId || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted font-medium">Method</span>
                  <span className="text-foreground font-bold">SSLCommerz Gateway</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <h3 className="text-foreground-disabled text-xs font-bold tracking-widest uppercase">
              Order Summary
            </h3>
            <div className="border-border overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2 border-border border-b">
                    <th className="text-foreground-muted px-6 py-4 text-[11px] font-bold tracking-wider uppercase">
                      Item / Description
                    </th>
                    <th className="text-foreground-muted px-6 py-4 text-right text-[11px] font-bold tracking-wider uppercase">
                      Price
                    </th>
                    <th className="text-foreground-muted px-6 py-4 text-right text-[11px] font-bold tracking-wider uppercase">
                      Qty
                    </th>
                    <th className="text-foreground-muted px-6 py-4 text-right text-[11px] font-bold tracking-wider uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-border border-b">
                    <td className="px-6 py-5">
                      <p className="text-foreground text-sm font-bold">
                        {w.title || "Workshop Enrollment"}
                      </p>
                      <p className="text-foreground-muted mt-0.5 text-[11px]">
                        Workshop Registration Fee
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-medium">
                      {formatCurrency((p.amount ?? 0) / (e.studentCount || 1))}
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-medium">
                      {e.studentCount || 1}
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-bold">
                      {formatCurrency(p.amount ?? 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-full space-y-3 sm:w-64">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground-muted">Subtotal</span>
                <span className="text-foreground">{formatCurrency(p.amount ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground-muted">Tax (0%)</span>
                <span className="text-foreground">৳0.00</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-foreground text-base font-bold">Total Amount</span>
                <span className="text-primary font-display text-2xl font-black">
                  {formatCurrency(p.amount ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-border border-t border-dashed pt-12 text-center">
            <p className="text-foreground-subtle text-[13px] font-bold">
              Thank you for learning with us!
            </p>
            <p className="text-foreground-disabled mt-1 text-[11px] italic">
              This is a computer-generated document. No signature is required.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
