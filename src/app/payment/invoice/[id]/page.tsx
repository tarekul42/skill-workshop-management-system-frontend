"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone 
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { getInvoice } from "@/lib/api/services";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/shared";

// ═════════════════════════════════════════════════════════════════════
// INVOICE PAGE
// ═════════════════════════════════════════════════════════════════════

export default function InvoicePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getInvoice(id as string);
        setData(res);
      } catch (err) {
        setError("Failed to load invoice details.");
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
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-foreground-muted animate-pulse">Retrieving invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="size-16 rounded-3xl bg-danger/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="size-8 text-danger" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Unable to find invoice</h1>
            <p className="text-foreground-muted">We couldn't locate the invoice with the provided ID. Please check the transaction history in your dashboard.</p>
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
    <div className="min-h-screen bg-surface-2 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Top Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" asChild className="rounded-xl">
          <button onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </button>
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl h-11 px-5 font-bold">
            <Printer className="mr-2 size-4" />
            Print Invoice
          </Button>
          {data.invoiceUrl && (
            <Button asChild className="rounded-xl h-11 px-5 font-bold shadow-raised hover:shadow-float">
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
        className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Header Section */}
        <div className="p-8 sm:p-12 bg-linear-to-r from-primary to-primary-hover text-white flex flex-col sm:flex-row justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ShieldCheck className="size-7 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Invoice</h1>
              </div>
              <div className="space-y-1 opacity-80 text-sm font-medium">
                <div className="flex items-center gap-2"><Globe className="size-3.5" /> swms.com</div>
                <div className="flex items-center gap-2"><Mail className="size-3.5" /> support@swms.com</div>
              </div>
           </div>
           <div className="text-left sm:text-right space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest border border-white/10">
                {p.status || "PAID"}
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Invoice Number</p>
                <p className="text-xl font-mono font-bold">#INV-{id?.toString().slice(-8).toUpperCase()}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Date Issued</p>
                <p className="font-bold">{formatDate(p.createdAt || new Date())}</p>
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 sm:p-12 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground-disabled uppercase tracking-widest border-b border-border pb-2">Bill To</h3>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">{u.name || "—"}</p>
                  <p className="text-sm text-foreground-subtle font-medium">{u.email}</p>
                  <p className="text-sm text-foreground-subtle">{u.phone || "—"}</p>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground-disabled uppercase tracking-widest border-b border-border pb-2">Payment Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted font-medium">Transaction ID</span>
                    <span className="font-mono font-bold text-foreground">{p.transactionId || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted font-medium">Method</span>
                    <span className="font-bold text-foreground">SSLCommerz Gateway</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground-disabled uppercase tracking-widest">Order Summary</h3>
            <div className="rounded-2xl border border-border overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border">
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Item / Description</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted text-right">Price</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted text-right">Qty</th>
                       <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                       <td className="px-6 py-5">
                          <p className="text-sm font-bold text-foreground">{w.title || "Workshop Enrollment"}</p>
                          <p className="text-[11px] text-foreground-muted mt-0.5">Workshop Registration Fee</p>
                       </td>
                       <td className="px-6 py-5 text-right font-medium text-sm">
                          {formatCurrency(p.amount / (e.studentCount || 1))}
                       </td>
                       <td className="px-6 py-5 text-right font-medium text-sm">
                          {e.studentCount || 1}
                       </td>
                       <td className="px-6 py-5 text-right font-bold text-sm">
                          {formatCurrency(p.amount)}
                       </td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
             <div className="w-full sm:w-64 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(p.amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-foreground-muted">Tax (0%)</span>
                  <span className="text-foreground">৳0.00</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-base font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-black text-primary font-display">{formatCurrency(p.amount)}</span>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="pt-12 text-center border-t border-dashed border-border">
             <p className="text-[13px] font-bold text-foreground-subtle">Thank you for learning with us!</p>
             <p className="text-[11px] text-foreground-disabled mt-1 italic">This is a computer-generated document. No signature is required.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
