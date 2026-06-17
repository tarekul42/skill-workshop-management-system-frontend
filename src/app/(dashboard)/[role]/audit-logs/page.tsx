"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateTime, truncate } from "@/lib/formatters";
import { getAuditLogs } from "@/lib/api/services";
import type { IAuditLog, AuditAction } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Action badge styles ─────────────────────────────────────────────

const actionStyles: Record<AuditAction, string> = {
  CREATE: "border-success/30 bg-success-subtle text-success",
  UPDATE: "border-info/30 bg-info-subtle text-info",
  DELETE: "border-danger/30 bg-danger-subtle text-danger",
};

// ─── Known collections ───────────────────────────────────────────────

const KNOWN_COLLECTIONS = ["User", "Workshop", "Category", "Level", "Enrollment", "Payment"];

// ─── Component ───────────────────────────────────────────────────────

export default function AuditLogsPage({ params }: PageProps) {
  React.use(params);
  // Data state
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [filterCollection, setFilterCollection] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // ── Fetch logs ─────────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit,
        collectionName: filterCollection || undefined,
        action: filterAction || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });
      setLogs(res.data);
      setTotalPages(res.meta.totalPage);
      setTotal(res.meta.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterCollection, filterAction, filterStartDate, filterEndDate]);

  useEffect(() => {
    // Pure fix: Defer initial fetch to avoid cascading render lint error
    const timer = setTimeout(() => fetchLogs(), 0);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  // ── Handlers ───────────────────────────────────────────────────────

  const resetFilters = () => {
    setFilterCollection("");
    setFilterAction("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPage(1);
  };

  const hasActiveFilters = filterCollection || filterAction || filterStartDate || filterEndDate;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system changes" />

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Collection</Label>
            <Select
              value={filterCollection}
              onValueChange={(v) => {
                setFilterCollection(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {KNOWN_COLLECTIONS.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Action</Label>
            <Select
              value={filterAction}
              onValueChange={(v) => {
                setFilterAction(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Start Date</Label>
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">End Date</Label>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* ── Info bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{total} log entries total</p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Collection</TableHead>
            <TableHead>Document ID</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="p-4">
                <TableSkeleton rows={5} columns={6} />
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <p className="text-muted-foreground text-sm">
                  {hasActiveFilters ? "No logs match your filters." : "No audit logs found."}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <Badge variant="outline" className={actionStyles[log.action]}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{log.collectionName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-xs">
                    {truncate(log.documentId, 14)}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{log.performedBy?.name || "System"}</p>
                    {log.performedBy?.role && (
                      <p className="text-muted-foreground text-xs">{log.performedBy.role}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-xs">
                    {log.ipAddress || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDateTime(log.createdAt)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Server Pagination ──────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
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
    </div>
  );
}
