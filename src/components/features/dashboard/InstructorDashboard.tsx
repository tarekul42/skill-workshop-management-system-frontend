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
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-page";
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

function AnimatedNumber({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(
    isCurrency ? formatCurrency(0) : "0",
  );

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
  const firstName =
    user?.firstName || user?.name?.split(" ")[0] || "Instructor";

  return (
    <AnimatedPage className="space-y-8">
      {/* ── Section 1: Greeting ────────────────────────────────────── */}
      <div className="relative border-b border-border pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-foreground-disabled font-bold uppercase tracking-widest text-[11px]">
              <span>{greeting.text}</span>
              <span className="opacity-70">{greeting.emoji}</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-4 text-lg text-foreground-subtle leading-relaxed">
              Your workshops are reaching{" "}
              <span className="text-primary font-bold">
                {stats.totalStudents}
              </span>{" "}
              students. Keep building!
            </p>
          </div>
          <div className="mt-4 md:mt-0 shrink-0">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl font-bold shadow-lg transition-all hover:shadow-xl group px-8"
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
          <div className="glass rounded-[24px] p-7 shadow-sm transition-all duration-300 hover:shadow-3 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled mb-4">
                  My Workshops
                </p>
                <div className="font-display text-4xl font-extrabold text-foreground leading-none">
                  <AnimatedNumber value={stats.totalWorkshops} />
                </div>
                <p className="mt-3 text-[11px] font-bold text-foreground-muted uppercase tracking-wide">
                  {stats.publishedCount} published · {stats.draftCount} draft
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-subtle shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <BookOpen className="size-7 text-primary" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Students */}
        <StaggerItem>
          <div className="glass rounded-[24px] p-7 shadow-sm transition-all duration-300 hover:shadow-3 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled mb-4">
                  Total Students
                </p>
                <div className="font-display text-4xl font-extrabold text-foreground leading-none">
                  <AnimatedNumber value={stats.totalStudents} />
                </div>
                <p className="mt-3 text-[11px] font-bold text-success uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  +12% this month
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-success-subtle shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Users className="size-7 text-success" />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Total Revenue */}
        <StaggerItem>
          <div className="glass rounded-[24px] p-7 shadow-sm transition-all duration-300 hover:shadow-3 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled mb-4">
                  Total Revenue
                </p>
                <div className="font-display text-[32px] font-extrabold text-foreground leading-none tracking-tight">
                  <AnimatedNumber value={stats.totalRevenue} isCurrency />
                </div>
                <p className="mt-3 text-[11px] font-bold text-foreground-muted uppercase tracking-wide">
                  Lifetime earnings
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-subtle shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <DollarSign className="size-7 text-accent-foreground" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: Revenue Chart ──────────────────────────────── */}
      <StaggerItem>
        <div className="glass rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:shadow-2">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Monthly Revenue
            </h2>
            <div className="flex rounded-xl bg-surface-2 p-1 border border-border/40">
              {["3M", "6M", "12M"].map((tab) => (
                <button
                  key={tab}
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-foreground-disabled transition-all hover:text-foreground active:scale-95"
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
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
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
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Revenue",
                  ]}
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
          <div className="glass rounded-[32px] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-2">
            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-surface-1/30">
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                My Workshops
              </h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-foreground-muted font-bold text-xs uppercase tracking-widest hover:text-primary"
              >
                <Link href="/instructor/workshops">
                  Manage <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-2/60 border-b border-border/50">
                  <tr>
                    <th className="px-8 py-4 font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled">
                      Workshop
                    </th>
                    <th className="px-8 py-4 font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled">
                      Students
                    </th>
                    <th className="px-8 py-4 font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground-disabled">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentWorkshops.map((workshop) => (
                    <tr
                      key={workshop._id}
                      className="hover:bg-surface-2/40 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-xl bg-surface-3 flex items-center justify-center overflow-hidden shrink-0 border border-border/50 transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <BookOpen className="size-5.5 text-foreground-disabled" />
                          </div>
                          <span className="font-body text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {workshop.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-body text-sm font-semibold text-foreground">
                        {workshop.currentEnrollments || 0}
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={workshop.status as string} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          href={`/instructor/workshops/edit/${workshop._id}`}
                          className="flex size-9 items-center justify-center rounded-lg text-foreground-disabled hover:bg-primary/10 hover:text-primary transition-all"
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
                        className="flex items-center justify-center w-full py-5 border-2 border-dashed border-border/60 rounded-2xl text-primary font-bold text-sm hover:bg-primary/5 hover:border-primary/40 transition-all group"
                      >
                        <Plus className="size-5 mr-2.5 group-hover:scale-125 transition-transform" />
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
          <div className="glass rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:shadow-2 flex flex-col h-full">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Enrollment Trends
              </h2>
              <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-widest mt-1.5">
                Activity over last 8 weeks
              </p>
            </div>
            <div className="flex-1 w-full min-h-50">
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
        <div className="glass rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:shadow-2">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Recent Student Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-foreground-muted font-bold text-xs uppercase tracking-widest hover:text-primary"
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
                  className="flex items-center gap-5 p-5 rounded-[20px] border border-border/50 bg-background/40 hover:bg-surface-2 transition-all duration-300 hover:shadow-md group"
                >
                  <div className="size-14 rounded-full bg-surface-3 flex items-center justify-center text-foreground-disabled shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
                    <Users className="size-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[15px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {enrollment.studentName || "Anonymous Student"}
                    </p>
                    <p className="text-sm text-foreground-muted truncate mt-0.5">
                      Enrolled in{" "}
                      <span className="font-semibold text-foreground-subtle">
                        {enrollment.workshopTitle}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-wide mb-2">
                      {formatDate(enrollment.date)}
                    </p>
                    <StatusBadge status={enrollment.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-surface-3 mb-3">
                  <LayoutDashboard className="size-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No recent enrollments yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </StaggerItem>
    </AnimatedPage>
  );
}
