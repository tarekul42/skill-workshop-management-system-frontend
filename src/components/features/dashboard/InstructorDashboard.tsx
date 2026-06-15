"use client";

import { useEffect, useState } from "react";
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
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/ui/animated-page";
import { StatusBadge } from "@/components/ui/status-badge";

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
      <div className="border-border relative border-b pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-foreground-disabled mb-3 flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
              <span>{greeting.text}</span>
              <span className="opacity-70">{greeting.emoji}</span>
            </div>
            <h1 className="font-display text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">
              Welcome back, {firstName}!
            </h1>
            <p className="text-foreground-subtle mt-4 text-lg leading-relaxed">
              Your workshops are reaching{" "}
              <span className="text-primary font-bold">{stats.totalStudents}</span> students. Keep
              building!
            </p>
          </div>
          <div className="mt-4 shrink-0 md:mt-0">
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-2xl px-8 font-bold shadow-lg transition-all hover:shadow-xl"
            >
              <Link href="/instructor/workshops/create">
                <Plus className="mr-2.5 size-5 transition-transform group-hover:scale-110" />
                Create Workshop
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Grid ─────────────────────────────────── */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-3">
        {/* My Workshops */}
        <StaggerItem>
          <div className="glass hover:shadow-3 group rounded-3xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-foreground-disabled mb-4 text-[11px] font-bold tracking-widest uppercase">
                  My Workshops
                </p>
                <div className="font-display text-foreground text-4xl leading-none font-extrabold">
                  <AnimatedNumber value={stats.totalWorkshops} />
                </div>
                <p className="text-foreground-muted mt-3 text-[11px] font-bold tracking-wide uppercase">
                  {stats.publishedCount} published · {stats.draftCount} draft
                </p>
              </div>
              <div className="bg-primary-subtle flex size-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <BookOpen className="text-primary size-7" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Students */}
        <StaggerItem>
          <div className="glass hover:shadow-3 group rounded-3xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-foreground-disabled mb-4 text-[11px] font-bold tracking-widest uppercase">
                  Total Students
                </p>
                <div className="font-display text-foreground text-4xl leading-none font-extrabold">
                  <AnimatedNumber value={stats.totalStudents} />
                </div>
                <p className="text-success mt-3 flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                  <TrendingUp className="size-3.5" />
                  +12% this month
                </p>
              </div>
              <div className="bg-success-subtle flex size-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Users className="text-success size-7" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Revenue */}
        <StaggerItem>
          <div className="glass hover:shadow-3 group rounded-3xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-foreground-disabled mb-4 text-[11px] font-bold tracking-widest uppercase">
                  Total Revenue
                </p>
                <div className="font-display text-foreground text-[32px] leading-none font-extrabold tracking-tight">
                  <AnimatedNumber value={stats.totalRevenue} isCurrency />
                </div>
                <p className="text-foreground-muted mt-3 text-[11px] font-bold tracking-wide uppercase">
                  Lifetime earnings
                </p>
              </div>
              <div className="bg-accent-subtle flex size-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <DollarSign className="text-accent-foreground size-7" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: Revenue Chart ──────────────────────────────── */}
      <StaggerItem>
        <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
              Monthly Revenue
            </h2>
            <div className="bg-surface-2 border-border/40 flex rounded-xl border p-1">
              {["3M", "6M", "12M"].map((tab) => (
                <button
                  key={tab}
                  className="text-foreground-disabled hover:text-foreground rounded-lg px-4 py-1.5 text-xs font-bold transition-all active:scale-95"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="h-70 w-full">
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
                  tick={{
                    fill: "var(--foreground-muted)",
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                  }}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontFamily: "var(--font-display)",
                    fontWeight: "700",
                  }}
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
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
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Workshops Table */}
        <StaggerItem>
          <div className="glass hover:shadow-2 overflow-hidden rounded-4xl shadow-sm transition-all duration-300">
            <div className="border-border/50 bg-surface-1/30 flex items-center justify-between border-b p-8">
              <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                My Workshops
              </h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-foreground-muted hover:text-primary text-xs font-bold tracking-widest uppercase"
              >
                <Link href="/instructor/workshops">
                  Manage <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-2/60 border-border/50 border-b">
                  <tr>
                    <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                      Workshop
                    </th>
                    <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                      Students
                    </th>
                    <th className="font-body text-foreground-disabled px-8 py-4 text-[11px] font-bold tracking-widest uppercase">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-border/30 divide-y">
                  {recentWorkshops.map((workshop) => (
                    <tr
                      key={workshop._id}
                      className="hover:bg-surface-2/40 group transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="bg-surface-3 border-border/50 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <BookOpen className="text-foreground-disabled size-5.5" />
                          </div>
                          <span className="font-body text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
                            {workshop.title}
                          </span>
                        </div>
                      </td>
                      <td className="font-body text-foreground px-8 py-5 text-sm font-semibold">
                        {workshop.currentEnrollments || 0}
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={workshop.status as string} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          href={`/instructor/workshops/edit/${workshop._id}`}
                          className="text-foreground-disabled hover:bg-primary/10 hover:text-primary flex size-9 items-center justify-center rounded-lg transition-all"
                        >
                          <Edit className="size-4.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {/* Create New dashed row */}
                  <tr>
                    <td colSpan={4} className="p-3">
                      <Link
                        href="/instructor/workshops/create"
                        className="border-border/60 text-primary hover:bg-primary/5 hover:border-primary/40 group flex w-full items-center justify-center rounded-2xl border-2 border-dashed py-5 text-sm font-bold transition-all"
                      >
                        <Plus className="mr-2.5 size-5 transition-transform group-hover:scale-125" />
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
          <div className="glass hover:shadow-2 flex h-full flex-col rounded-4xl p-8 shadow-sm transition-all duration-300">
            <div className="mb-8">
              <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                Enrollment Trends
              </h2>
              <p className="text-foreground-disabled mt-1.5 text-[11px] font-bold tracking-widest uppercase">
                Activity over last 8 weeks
              </p>
            </div>
            <div className="min-h-50 w-full flex-1">
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
        <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
              Recent Student Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-foreground-muted hover:text-primary text-xs font-bold tracking-widest uppercase"
            >
              <Link href="/instructor/enrollments">
                View All <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentEnrollments.length > 0 ? (
              recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="border-border/50 bg-background/40 hover:bg-surface-2 group flex items-center gap-5 rounded-[20px] border p-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="bg-surface-3 text-foreground-disabled border-border/50 flex size-14 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:scale-105">
                    <Users className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-foreground group-hover:text-primary truncate text-[15px] font-bold transition-colors">
                      {enrollment.studentName || "Anonymous Student"}
                    </p>
                    <p className="text-foreground-muted mt-0.5 truncate text-sm">
                      Enrolled in{" "}
                      <span className="text-foreground-subtle font-semibold">
                        {enrollment.workshopTitle}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-foreground-disabled mb-2 text-[11px] font-bold tracking-wide uppercase">
                      {formatDate(enrollment.date)}
                    </p>
                    <StatusBadge status={enrollment.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="bg-surface-3 mb-3 inline-flex size-12 items-center justify-center rounded-full">
                  <LayoutDashboard className="text-muted-foreground/40 size-6" />
                </div>
                <p className="text-muted-foreground text-sm">No recent enrollments yet.</p>
              </div>
            )}
          </div>
        </div>
      </StaggerItem>
    </AnimatedPage>
  );
}
