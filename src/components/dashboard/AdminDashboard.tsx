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
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedPage";
import { Badge } from "@/components/ui/badge";

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

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--info)",
  "var(--accent)",
];

// ─── Main Component ─────────────────────────────────────────────────

export function AdminDashboard({
  user,
  stats,
  auditLogs,
  health,
  distribution,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "revenue" | "enrollments" | "users"
  >("revenue");

  return (
    <AnimatedPage className="space-y-8">
      {/* ── Section 1: Page Header ────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Platform Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Admin"}. Everything is running smoothly.
        </p>
      </div>

      {/* ── Section 2: Stats Grid with Sparklines ──────────────────── */}
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardWithSparkline
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="size-5 text-primary" />}
          iconBg="bg-primary-subtle"
          data={sparklineData}
          color="var(--primary)"
        />
        <StatCardWithSparkline
          label="Workshops"
          value={stats.totalWorkshops.toLocaleString()}
          icon={<BookOpen className="size-5 text-success" />}
          iconBg="bg-success-subtle"
          data={sparklineData.map((d) => ({ value: d.value * 0.8 }))}
          color="var(--success)"
        />
        <StatCardWithSparkline
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="size-5 text-warning" />}
          iconBg="bg-warning-subtle"
          data={sparklineData.map((d) => ({ value: d.value * 1.2 }))}
          color="var(--warning)"
        />
        <StatCardWithSparkline
          label="Enrollments"
          value={stats.totalEnrollments.toLocaleString()}
          icon={<ClipboardList className="size-5 text-info" />}
          iconBg="bg-info-subtle"
          data={sparklineData.map((d) => ({ value: d.value * 1.1 }))}
          color="var(--accent)"
        />
      </StaggerContainer>

      {/* ── Section 3: Main Content (2 Columns) ────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Left Column: Analytics & Logs */}
        <div className="space-y-8">
          {/* Main Analytics Chart */}
          <StaggerItem>
            <div className="rounded-3xl border border-border bg-surface-1 p-6 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Performance Trends
                </h2>
                <div className="flex rounded-xl bg-surface-2 p-1">
                  {(["revenue", "enrollments", "users"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-xs font-bold capitalize transition-all rounded-lg ${
                        activeTab === tab
                          ? "bg-surface-1 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
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
                      <linearGradient
                        id="colorMain"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
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
          </StaggerItem>

          {/* Audit Logs */}
          <StaggerItem>
            <div className="rounded-3xl border border-border bg-surface-1 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Recent Audit Logs
                </h2>
                <Badge variant="outline">Live Feed</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-2 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Action
                      </th>
                      <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        User
                      </th>
                      <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        When
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr
                          key={log._id}
                          className="hover:bg-surface-2 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-body text-sm font-semibold text-foreground capitalize">
                                {log.action.replace(/_/g, " ")}
                              </span>
                              <span className="text-[11px] text-muted-foreground uppercase">
                                {log.collection}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground font-medium">
                            {log.userEmail}
                          </td>
                          <td className="px-6 py-4 text-[11px] text-muted-foreground">
                            {formatDate(log.timestamp)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-muted-foreground text-sm italic"
                        >
                          No recent logs recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </StaggerItem>
        </div>

        {/* Right Column: Distribution & Health */}
        <div className="space-y-8">
          {/* User Distribution */}
          <StaggerItem>
            <div className="rounded-3xl border border-border bg-surface-1 p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                User Distribution
              </h2>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution.roles}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
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
                        borderRadius: "10px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>

          {/* Workshop Distribution */}
          <StaggerItem>
            <div className="rounded-3xl border border-border bg-surface-1 p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Popular Categories
              </h2>
              <div className="space-y-4">
                {distribution.categories.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground">
                        {cat.count} enrollments
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(cat.count / Math.max(...distribution.categories.map((c) => c.count))) * 100}%`,
                          transition:
                            "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          {/* Platform Health */}
          <StaggerItem>
            <div className="rounded-3xl border border-border bg-surface-1 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Platform Health
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-subtle text-success text-[10px] font-bold uppercase tracking-wider">
                  <div className="size-1.5 rounded-full bg-success animate-pulse" />
                  Stable
                </div>
              </div>
              <div className="space-y-3">
                <HealthCard
                  name="API Server"
                  status={health.api.status}
                  latency={health.api.latency}
                  icon={<Globe className="size-4" />}
                />
                <HealthCard
                  name="Database"
                  status={health.db.status}
                  latency={health.db.latency}
                  icon={<Database className="size-4" />}
                />
                <HealthCard
                  name="Core Service"
                  status={health.cache.status}
                  latency={health.cache.latency}
                  icon={<ShieldCheck className="size-4" />}
                />
              </div>
            </div>
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
      <div className="relative overflow-hidden rounded-[20px] border border-border bg-surface-1 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}
          >
            {icon}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
              {value}
            </h3>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 h-15 w-25 opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
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
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/50">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm font-bold text-foreground">{name}</p>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${colorClass}`}>
              {status}
            </span>
            <span className="text-[10px] text-muted-foreground opacity-50">
              ·
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium">
              <Clock className="size-2.5" /> {latency}ms
            </div>
          </div>
        </div>
      </div>
      {isHealthy ? (
        <CheckCircle2 className="size-5 text-success/50" />
      ) : status === "DEGRADED" ? (
        <AlertCircle className="size-5 text-warning/50" />
      ) : (
        <XCircle className="size-5 text-destructive/50" />
      )}
    </div>
  );
}
