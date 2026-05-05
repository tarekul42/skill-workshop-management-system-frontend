"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { animate } from "framer-motion";
import {
  BookOpen,
  Users,
  DollarSign,
  ArrowRight,
  Plus,
  Edit,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedPage";

// ─── Types ──────────────────────────────────────────────────────────

export interface InstructorWorkshopItem {
  _id: string;
  title: string;
  slug?: string;
  currentEnrollments?: number;
  maxSeats?: number;
  revenue?: number;
  status?: string;
  createdAt?: string;
  thumbnail?: string;
}

export interface InstructorEnrollmentItem {
  _id: string;
  studentName?: string;
  workshopTitle: string;
  date: string;
  status: string;
}

export interface InstructorDashboardProps {
  user: { name?: string; firstName?: string } | null;
  stats: {
    totalWorkshops: number;
    totalStudents: number;
    totalRevenue: number;
    publishedCount: number;
    draftCount: number;
  };
  recentWorkshops: InstructorWorkshopItem[];
  recentEnrollments: InstructorEnrollmentItem[];
}

// ─── Mock Data ──────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", amount: 15000 },
  { month: "Feb", amount: 28000 },
  { month: "Mar", amount: 22000 },
  { month: "Apr", amount: 34000 },
  { month: "May", amount: 42000 },
  { month: "Jun", amount: 38000 },
];

const enrollmentTrendData = [
  { week: "W1", count: 4 },
  { week: "W2", count: 7 },
  { week: "W3", count: 5 },
  { week: "W4", count: 12 },
  { week: "W5", count: 9 },
  { week: "W6", count: 15 },
  { week: "W7", count: 18 },
  { week: "W8", count: 22 },
];

// ─── Helpers ────────────────────────────────────────────────────────

function AnimatedNumber({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(isCurrency ? formatCurrency(0) : "0");
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (isCurrency) {
          setDisplayValue(formatCurrency(latest));
        } else {
          setDisplayValue(Math.floor(latest).toString());
        }
      },
    });
    return controls.stop;
  }, [value, isCurrency]);

  return <span>{displayValue}</span>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 18) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

// ─── Main Component ─────────────────────────────────────────────────

export function InstructorDashboard({
  user,
  stats,
  recentWorkshops,
  recentEnrollments,
}: InstructorDashboardProps) {
  const greeting = getGreeting();
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Instructor";

  return (
    <AnimatedPage className="space-y-8">
      {/* ── Section 1: Greeting ────────────────────────────────────── */}
      <div className="relative border-b border-border pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
              <span>{greeting.text}</span>
              <span>{greeting.emoji}</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Your workshops are reaching {stats.totalStudents} students. Keep building!
            </p>
          </div>
          <div className="mt-4 md:mt-0 shrink-0">
            <Button asChild size="lg" className="rounded-[10px] font-display shadow-sm group">
              <Link href="/instructor/workshops/create">
                <Plus className="mr-2 size-4" />
                Create Workshop
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Grid ─────────────────────────────────── */}
      <StaggerContainer className="grid gap-5 sm:grid-cols-3">
        {/* My Workshops */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  My Workshops
                </p>
                <div className="mt-3 font-display text-4xl font-extrabold text-foreground">
                  <AnimatedNumber value={stats.totalWorkshops} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.publishedCount} published · {stats.draftCount} draft
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-primary-subtle">
                <BookOpen className="size-5 text-primary" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Students */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Students
                </p>
                <div className="mt-3 font-display text-4xl font-extrabold text-foreground">
                  <AnimatedNumber value={stats.totalStudents} />
                </div>
                <p className="mt-1 text-xs text-success flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  +12% this month
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-success-subtle">
                <Users className="size-5 text-success" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Revenue */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Revenue
                </p>
                <div className="mt-3 font-display text-3xl font-extrabold text-foreground tracking-tight">
                  <AnimatedNumber value={stats.totalRevenue} isCurrency />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-accent-subtle">
                <DollarSign className="size-5 text-accent-foreground" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: Revenue Chart ──────────────────────────────── */}
      <StaggerItem>
        <div className="rounded-[20px] border border-border bg-surface-1 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Monthly Revenue</h2>
            <div className="flex gap-2">
              {["3M", "6M", "12M"].map((tab) => (
                <button
                  key={tab}
                  className="rounded-lg px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground active:bg-primary-subtle active:text-primary"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-body)" }}
                />
                <YAxis
                  hide
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontFamily: "var(--font-display)",
                    fontWeight: "700",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StaggerItem>

      {/* ── Section 4: My Workshops Table & Trends ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Workshops Table */}
        <StaggerItem>
          <div className="rounded-[20px] border border-border bg-surface-1 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">My Workshops</h2>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link href="/instructor/workshops">
                  Manage <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-2 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Workshop</th>
                    <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Students</th>
                    <th className="px-6 py-3 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentWorkshops.map((workshop) => (
                    <tr key={workshop._id} className="hover:bg-surface-2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-surface-3 flex items-center justify-center overflow-hidden shrink-0">
                            <BookOpen className="size-5 text-muted-foreground/50" />
                          </div>
                          <span className="font-body text-sm font-semibold text-foreground line-clamp-1">{workshop.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-body text-sm text-foreground">
                        {workshop.currentEnrollments || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={workshop.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/instructor/workshops/edit/${workshop._id}`} className="text-muted-foreground hover:text-primary transition-colors">
                          <Edit className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {/* Create New dashed row */}
                  <tr>
                    <td colSpan={4} className="p-0">
                      <Link
                        href="/instructor/workshops/create"
                        className="flex items-center justify-center w-full py-4 border-2 border-dashed border-border m-2 rounded-xl text-primary font-semibold hover:bg-primary-subtle transition-all group"
                      >
                        <Plus className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                        Create New Workshop
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </StaggerItem>

        {/* Enrollment Trend Chart */}
        <StaggerItem>
          <div className="rounded-[20px] border border-border bg-surface-1 p-6 shadow-sm flex flex-col h-full">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Enrollment Trends</h2>
              <p className="text-xs text-muted-foreground mt-1">Activity over last 8 weeks</p>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentTrendData}>
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--surface-3)", radius: 6 }}
                    contentStyle={{
                      backgroundColor: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </StaggerItem>
      </div>

      {/* ── Section 5: Recent Enrollments ─────────────────────────── */}
      <StaggerItem>
        <div className="rounded-[20px] border border-border bg-surface-1 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Recent Student Activity</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/instructor/enrollments">
                View All <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentEnrollments.length > 0 ? (
              recentEnrollments.map((enrollment) => (
                <div key={enrollment._id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors">
                  <div className="size-10 rounded-full bg-surface-3 flex items-center justify-center text-muted-foreground shrink-0">
                    <Users className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-foreground truncate">
                      {enrollment.studentName || "Anonymous Student"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Enrolled in <span className="font-medium text-foreground">{enrollment.workshopTitle}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-muted-foreground mb-1">{formatDate(enrollment.date)}</p>
                    <StatusBadge status={enrollment.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-surface-3 mb-3">
                  <LayoutDashboard className="size-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No recent enrollments yet.</p>
              </div>
            )}
          </div>
        </div>
      </StaggerItem>
    </AnimatedPage>
  );
}

// ─── StatusBadge (Shared-ish) ───────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toUpperCase();

  if (s === "PENDING" || s === "DRAFT") {
    return (
      <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-warning-subtle px-2.5 font-body text-[11px] font-semibold tracking-[0.02em] text-warning">
        <span className="size-1.5 rounded-full bg-warning"></span>
        {status}
      </div>
    );
  }
  if (s === "COMPLETE" || s === "PAID" || s === "PUBLISHED" || s === "ACTIVE") {
    return (
      <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-success-subtle px-2.5 font-body text-[11px] font-semibold tracking-[0.02em] text-success">
        <span className="size-1.5 rounded-full bg-success"></span>
        {status}
      </div>
    );
  }
  return (
    <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-surface-3 px-2.5 font-body text-[11px] font-semibold tracking-[0.02em] text-foreground-muted">
      {status}
    </div>
  );
}
