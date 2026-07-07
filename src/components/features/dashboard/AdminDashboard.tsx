"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  ClipboardList,
  ShieldCheck,
  Database,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { maskEmail } from "@/lib/utils/masking";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/ui/animated-page";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { AuditAction } from "@/types/audit.types";

const PerformanceTrendChart = dynamic(
  () => import("@/components/charts/AdminCharts").then((m) => m.PerformanceTrendChart),
  { ssr: false }
);

const UserDistributionChart = dynamic(
  () => import("@/components/charts/AdminCharts").then((m) => m.UserDistributionChart),
  { ssr: false }
);

const SparklineChart = dynamic(
  () => import("@/components/charts/SparklineChart").then((m) => m.SparklineChart),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────

export interface AuditLogItem {
  _id: string;
  action: AuditAction;
  collectionName: string;
  documentId: string;
  performedBy?: { _id: string; name: string; email: string; role: string };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PlatformHealth {
  api: { status: "HEALTHY" | "DEGRADED" | "DOWN"; latency: number };
  db: { status: "HEALTHY" | "DEGRADED" | "DOWN"; latency: number };
  cache: { status: "HEALTHY" | "DEGRADED" | "DOWN"; latency: number };
}

export interface AdminDashboardProps {
  user: { name?: string } | null;
  stats: {
    totalUsers: number;
    totalWorkshops: number;
    totalRevenue: number;
    totalEnrollments: number;
  };
  auditLogs: AuditLogItem[];
  auditBase?: string;
  health: PlatformHealth;
  distribution: {
    roles: { name: string; value: number }[];
    categories: { name: string; count: number }[];
  };
  trends: {
    enrollmentTrends: { _id: { year: number; month: number }; count: number }[];
    revenueTrends: { _id: { year: number; month: number }; revenue: number }[];
    userTrends: { _id: { year: number; month: number }; count: number }[];
    dailyEnrollments: { _id: { year: number; month: number; day: number }; count: number }[];
  } | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const actionStyles: Record<AuditAction | string, string> = {
  CREATE: "border-success/30 bg-success-subtle text-success",
  UPDATE: "border-info/30 bg-info-subtle text-info",
  DELETE: "border-danger/30 bg-danger-subtle text-danger",
};

// ─── Main Component ─────────────────────────────────────────────────

export function AdminDashboard({
  user,
  stats,
  auditLogs,
  auditBase = "/admin/audit-logs",
  health,
  distribution,
  trends,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"revenue" | "enrollments" | "users">("revenue");

  const dailySparkline = useMemo(() => {
    if (!trends?.dailyEnrollments?.length) {
      const fallback: { value: number }[] = [];
      for (let i = 0; i < 7; i++) fallback.push({ value: 0 });
      return fallback;
    }
    return trends.dailyEnrollments.map((d) => ({ value: d.count }));
  }, [trends]);

  const chartData = useMemo(() => {
    const source =
      activeTab === "revenue"
        ? trends?.revenueTrends
        : activeTab === "enrollments"
          ? trends?.enrollmentTrends
          : trends?.userTrends;

    if (!source?.length) {
      return [
        { name: MONTHS[new Date().getMonth()], value: 0 },
        { name: MONTHS[(new Date().getMonth() + 1) % 12], value: 0 },
      ];
    }

    return source.map((item) => ({
      name: MONTHS[item._id.month - 1],
      value:
        "revenue" in item
          ? (item as { revenue: number }).revenue
          : (item as { count: number }).count,
    }));
  }, [activeTab, trends]);

  return (
    <AnimatedPage className="space-y-8">
      {/* ── Section 1: Page Header ────────────────────────────────── */}
      <div className="border-border flex flex-col gap-2 border-b pb-6">
        <h1 className="font-display text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          Platform Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Admin"}. Everything is running smoothly.
        </p>
      </div>

      {/* ── Section 2: Stats Grid with Sparklines ──────────────────── */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="text-primary size-5" />}
            iconBg="bg-primary-subtle"
            data={dailySparkline}
            color="var(--primary)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Workshops"
            value={stats.totalWorkshops.toLocaleString()}
            icon={<BookOpen className="text-success size-5" />}
            iconBg="bg-success-subtle"
            data={dailySparkline}
            color="var(--success)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="text-warning size-5" />}
            iconBg="bg-warning-subtle"
            data={dailySparkline}
            color="var(--warning)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Enrollments"
            value={stats.totalEnrollments.toLocaleString()}
            icon={<ClipboardList className="text-info size-5" />}
            iconBg="bg-info-subtle"
            data={dailySparkline}
            color="var(--accent)"
          />
        </ErrorBoundary>
      </StaggerContainer>

      {/* ── Section 3: Main Content (2 Columns) ────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Left Column: Analytics & Logs */}
        <div className="space-y-8">
          {/* Main Analytics Chart */}
          <StaggerItem>
            <ErrorBoundary>
              <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                    Performance Trends
                  </h2>
                  <div className="bg-surface-2 border-border/40 shadow-inner-sm flex rounded-xl border p-1.5">
                    {(["revenue", "enrollments", "users"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-5 py-2 text-xs font-bold capitalize transition-all ${
                          activeTab === tab
                            ? "bg-surface-1 text-primary ring-border/20 shadow-sm ring-1"
                            : "text-foreground-muted hover:text-foreground hover:bg-surface-1/50"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80 w-full">
                  <PerformanceTrendChart data={chartData} />
                </div>
              </div>
            </ErrorBoundary>
          </StaggerItem>

          {/* Audit Logs */}
          <StaggerItem>
            <ErrorBoundary>
              <div className="glass hover:shadow-2 overflow-hidden rounded-4xl shadow-sm transition-all duration-300">
                <div className="border-border/50 bg-surface-1/30 flex items-center justify-between border-b p-8">
                  <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                    Recent Audit Logs
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={auditBase}>
                      View All <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-2/60 border-border/50 border-b">
                      <tr>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          Action
                        </th>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          Collection
                        </th>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          User
                        </th>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          IP
                        </th>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          When
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/30 divide-y">
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <tr
                            key={log._id}
                            className="hover:bg-surface-2/40 group transition-colors"
                          >
                            <td className="px-8 py-5">
                              <Badge variant="outline" className={actionStyles[log.action]}>
                                {log.action}
                              </Badge>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-foreground-disabled text-[10px] font-bold tracking-wide uppercase">
                                {log.collectionName}
                              </span>
                            </td>
                            <td className="text-foreground px-8 py-5 text-sm font-semibold">
                              {log.performedBy?.name ??
                                maskEmail(log.performedBy?.email) ??
                                "System"}
                              {log.performedBy?.role ? (
                                <span className="text-foreground-muted ml-1.5 text-[10px] font-medium">
                                  ({log.performedBy.role.replace(/_/g, " ")})
                                </span>
                              ) : null}
                            </td>
                            <td className="text-foreground-muted px-8 py-5 font-mono text-[11px]">
                              {log.ipAddress || "—"}
                            </td>
                            <td className="text-foreground-muted px-8 py-5 text-[11px] font-medium">
                              {formatDate(log.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-muted-foreground py-12 text-center text-sm italic"
                          >
                            No recent logs recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ErrorBoundary>
          </StaggerItem>
        </div>

        {/* Right Column: Distribution & Health */}
        <div className="space-y-8">
          {/* User Distribution */}
          <StaggerItem>
            <ErrorBoundary>
              <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
                <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight">
                  User Distribution
                </h2>
                <div className="h-60 w-full">
                  <UserDistributionChart roles={distribution.roles} />
                </div>
              </div>
            </ErrorBoundary>
          </StaggerItem>

          {/* Workshop Distribution */}
          <StaggerItem>
            <ErrorBoundary>
              <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
                <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight">
                  Popular Categories
                </h2>
                <div className="space-y-6">
                  {distribution.categories.length > 0 ? (
                    distribution.categories.map((cat) => {
                      const maxCount = Math.max(...distribution.categories.map((c) => c.count));
                      return (
                        <div key={cat.name} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                            <span className="text-foreground">{cat.name}</span>
                            <span className="text-foreground-muted">{cat.count} workshops</span>
                          </div>
                          <div className="bg-surface-3 h-2.5 w-full overflow-hidden rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(cat.count / maxCount) * 100}%` }}
                              viewport={{ once: true }}
                              className="bg-primary h-full rounded-full"
                              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                      No categories yet
                    </div>
                  )}
                </div>
              </div>
            </ErrorBoundary>
          </StaggerItem>

          {/* Platform Health */}
          <StaggerItem>
            <ErrorBoundary>
              <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                    Platform Health
                  </h2>
                  <div className="bg-success-subtle/50 text-success border-success/10 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    <div className="bg-success size-1.5 animate-pulse rounded-full shadow-[0_0_8px_var(--success)]" />
                    Stable
                  </div>
                </div>
                <div className="space-y-4">
                  <HealthCard
                    name="API Server"
                    status={health.api.status}
                    latency={health.api.latency}
                    icon={<Globe className="size-4.5" />}
                  />
                  <HealthCard
                    name="Database"
                    status={health.db.status}
                    latency={health.db.latency}
                    icon={<Database className="size-4.5" />}
                  />
                  <HealthCard
                    name="Cache"
                    status={health.cache.status}
                    latency={health.cache.latency}
                    icon={<ShieldCheck className="size-4.5" />}
                  />
                </div>
              </div>
            </ErrorBoundary>
          </StaggerItem>
        </div>
      </div>
    </AnimatedPage>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────

interface StatCardWithSparklineProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  data: { value: number }[];
  color: string;
}

function StatCardWithSparkline({
  label,
  value,
  icon,
  iconBg,
  data,
  color,
}: StatCardWithSparklineProps) {
  return (
    <StaggerItem>
      <div className="glass hover:shadow-3 group relative overflow-hidden rounded-3xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div
            className={`flex size-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3 ${iconBg}`}
          >
            {icon}
          </div>
          <div className="mt-5">
            <p className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
              {label}
            </p>
            <h3 className="font-display text-foreground mt-1 text-[28px] leading-none font-extrabold tracking-tight">
              {value}
            </h3>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 h-15 w-25 opacity-30 transition-opacity group-hover:opacity-50">
          <SparklineChart data={data} color={color} />
        </div>
      </div>
    </StaggerItem>
  );
}

interface HealthCardProps {
  name: string;
  status: string;
  latency: number;
  icon: React.ReactNode;
}

function HealthCard({ name, status, latency, icon }: HealthCardProps) {
  const isHealthy = status === "HEALTHY";
  const colorClass = isHealthy
    ? "text-success"
    : status === "DEGRADED"
      ? "text-warning"
      : "text-destructive";

  return (
    <div className="bg-surface-2 border-border/50 flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-foreground text-sm font-bold">{name}</p>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${colorClass}`}>{status}</span>
            <span className="text-muted-foreground text-[10px] opacity-50">·</span>
            <div className="text-muted-foreground flex items-center gap-0.5 text-[10px] font-medium">
              <Clock className="size-2.5" /> {latency}ms
            </div>
          </div>
        </div>
      </div>
      {isHealthy ? (
        <CheckCircle2 className="text-success/50 size-5" />
      ) : status === "DEGRADED" ? (
        <AlertCircle className="text-warning/50 size-5" />
      ) : (
        <XCircle className="text-destructive/50 size-5" />
      )}
    </div>
  );
}
