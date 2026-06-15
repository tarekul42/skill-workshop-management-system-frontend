"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/ui/animated-page";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────

export interface AuditLogItem {
  _id: string;
  action: string;
  collection: string;
  userEmail: string;
  timestamp: string;
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
  health: PlatformHealth;
  distribution: {
    roles: { name: string; value: number }[];
    categories: { name: string; count: number }[];
  };
}

// ─── Mock Trend Data ────────────────────────────────────────────────

const sparklineData = [
  { value: 40 },
  { value: 35 },
  { value: 55 },
  { value: 45 },
  { value: 70 },
  { value: 65 },
  { value: 85 },
];

const analyticsData = [
  { name: "Jan", revenue: 45000, enrollments: 120, users: 450 },
  { name: "Feb", revenue: 52000, enrollments: 150, users: 510 },
  { name: "Mar", revenue: 48000, enrollments: 140, users: 580 },
  { name: "Apr", revenue: 61000, enrollments: 190, users: 690 },
  { name: "May", revenue: 55000, enrollments: 175, users: 780 },
  { name: "Jun", revenue: 72000, enrollments: 230, users: 920 },
];

const COLORS = ["var(--primary)", "var(--success)", "var(--info)", "var(--accent)"];

// ─── Main Component ─────────────────────────────────────────────────

export function AdminDashboard({
  user,
  stats,
  auditLogs,
  health,
  distribution,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "enrollments" | "users">("revenue");

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
            data={sparklineData}
            color="var(--primary)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Workshops"
            value={stats.totalWorkshops.toLocaleString()}
            icon={<BookOpen className="text-success size-5" />}
            iconBg="bg-success-subtle"
            data={sparklineData.map((d) => ({ value: d.value * 0.8 }))}
            color="var(--success)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="text-warning size-5" />}
            iconBg="bg-warning-subtle"
            data={sparklineData.map((d) => ({ value: d.value * 1.2 }))}
            color="var(--warning)"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatCardWithSparkline
            label="Enrollments"
            value={stats.totalEnrollments.toLocaleString()}
            icon={<ClipboardList className="text-info size-5" />}
            iconBg="bg-info-subtle"
            data={sparklineData.map((d) => ({ value: d.value * 1.1 }))}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          boxShadow: "var(--shadow-md)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={activeTab}
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMain)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
                  <Badge
                    variant="outline"
                    className="bg-background/50 h-6 rounded-full px-3 text-[10px] font-bold tracking-widest uppercase"
                  >
                    Live Feed
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-2/60 border-border/50 border-b">
                      <tr>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          Action
                        </th>
                        <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                          User
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
                              <div className="flex flex-col">
                                <span className="font-body text-foreground group-hover:text-primary text-sm font-bold capitalize transition-colors">
                                  {log.action.replace(/_/g, " ")}
                                </span>
                                <span className="text-foreground-disabled mt-0.5 text-[10px] font-bold tracking-wide uppercase">
                                  {log.collection}
                                </span>
                              </div>
                            </td>
                            <td className="text-foreground px-8 py-5 text-sm font-semibold">
                              {log.userEmail}
                            </td>
                            <td className="text-foreground-muted px-8 py-5 text-[11px] font-medium">
                              {formatDate(log.timestamp)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution.roles}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={10}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {distribution.roles.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          boxShadow: "var(--shadow-md)",
                        }}
                      />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
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
                  {distribution.categories.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                        <span className="text-foreground">{cat.name}</span>
                        <span className="text-foreground-muted">{cat.count} enrollments</span>
                      </div>
                      <div className="bg-surface-3 h-2.5 w-full overflow-hidden rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(cat.count / Math.max(...distribution.categories.map((c) => c.count))) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          className="bg-primary h-full rounded-full"
                          transition={{
                            duration: 1.5,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      </div>
                    </div>
                  ))}
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
                    name="Core Service"
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={false}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
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
