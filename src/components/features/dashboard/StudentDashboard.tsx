"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { animate } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  Search,
  Banknote,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/ui/animated-page";
import { StatusBadge } from "@/components/ui/status-badge";

export interface DashboardEnrollmentItem {
  _id: string;
  status?: string;
  payment?: { amount?: number; status?: string };
  amount?: number;
  workshop?: string | { _id: string; title: string; slug?: string; images?: string[] };
  createdAt?: string;
  studentCount?: number;
}

export interface StudentDashboardProps {
  user: { name?: string; firstName?: string } | null;
  activeEnrollments: number;
  stats: {
    enrolled: number;
    completed: number;
    totalSpent: number;
    pendingPayments: number;
  };
  recentEnrollments: DashboardEnrollmentItem[];
}

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

export function StudentDashboard({
  user,
  activeEnrollments,
  stats,
  recentEnrollments,
}: StudentDashboardProps) {
  const greeting = getGreeting();
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Student";

  return (
    <AnimatedPage className="space-y-8">
      {/* ── Section 1: Greeting ────────────────────────────────────── */}
      <div className="border-border relative border-b pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 font-medium">
              <span>{greeting.text}</span>
              <span>{greeting.emoji}</span>
            </div>
            <h1 className="font-display text-foreground text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground mt-3 text-base">
              {activeEnrollments > 0
                ? `You have ${activeEnrollments} active enrollment${activeEnrollments === 1 ? "" : "s"}.`
                : "You haven't enrolled in any workshops yet. Browse what's available!"}
            </p>
          </div>
          <div className="mt-4 shrink-0 md:mt-0">
            <Button asChild size="lg" className="font-display group rounded-[10px] shadow-sm">
              <Link href="/workshops">
                Browse Workshops
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Cards ─────────────────────────────────── */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Enrolled */}
        <StaggerItem>
          <div className="glass hover:shadow-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Enrolled
              </p>
              <div className="bg-primary-subtle flex size-12 items-center justify-center rounded-xl shadow-sm">
                <BookOpen className="text-primary size-6" />
              </div>
            </div>
            <div className="font-display text-foreground mt-4 text-[32px] leading-none font-extrabold">
              <AnimatedNumber value={stats.enrolled} />
            </div>
          </div>
        </StaggerItem>

        {/* Completed */}
        <StaggerItem>
          <div className="glass hover:shadow-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Completed
              </p>
              <div className="bg-success-subtle flex size-12 items-center justify-center rounded-xl shadow-sm">
                <CheckCircle className="text-success size-6" />
              </div>
            </div>
            <div className="font-display text-foreground mt-4 text-[32px] leading-none font-extrabold">
              <AnimatedNumber value={stats.completed} />
            </div>
          </div>
        </StaggerItem>

        {/* Total Spent */}
        <StaggerItem>
          <div className="glass hover:shadow-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Total Spent
              </p>
              <div className="bg-accent-subtle flex size-12 items-center justify-center rounded-xl shadow-sm">
                <Banknote className="text-accent-foreground size-6" />
              </div>
            </div>
            <div className="font-display text-foreground mt-4 text-[28px] leading-none font-extrabold tracking-tight">
              <AnimatedNumber value={stats.totalSpent} isCurrency />
            </div>
          </div>
        </StaggerItem>

        {/* Pending Payments */}
        <StaggerItem>
          <div className="glass hover:shadow-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Pending
              </p>
              <div className="bg-warning-subtle flex size-12 items-center justify-center rounded-xl shadow-sm">
                <Clock className="text-warning size-6" />
              </div>
            </div>
            <div className="font-display text-foreground mt-4 text-[32px] leading-none font-extrabold">
              <AnimatedNumber value={stats.pendingPayments} />
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: My Recent Enrollments ───────────────────────── */}
      <StaggerItem>
        <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
              My Recent Enrollments
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-foreground-muted hover:text-primary text-xs font-bold tracking-widest uppercase"
            >
              <Link href="/student/enrollments">
                View All <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>

          {recentEnrollments.length > 0 ? (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => {
                const workshopTitle =
                  typeof enrollment.workshop === "object" && enrollment.workshop?.title
                    ? enrollment.workshop.title
                    : "Workshop";
                const workshopSlug =
                  typeof enrollment.workshop === "object" ? enrollment.workshop?.slug : null;

                const isPending =
                  enrollment.status === "PENDING" || enrollment.payment?.status === "UNPAID";

                return (
                  <div
                    key={enrollment._id}
                    className="border-border/50 bg-background/40 hover:bg-surface-2 group flex flex-col gap-5 rounded-[20px] border p-5 transition-all duration-300 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    {/* Left content: Image & Info */}
                    <div className="flex flex-1 items-center gap-5">
                      <div className="bg-surface-3 border-border/50 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-transform group-hover:scale-105 group-hover:rotate-3">
                        <BookOpen className="text-foreground-disabled/60 size-7" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={workshopSlug ? `/workshops/${workshopSlug}` : "#"}
                          className="font-display text-foreground hover:text-primary line-clamp-1 text-lg font-bold transition-colors"
                        >
                          {workshopTitle}
                        </Link>
                        <div className="mt-1.5 flex items-center gap-4">
                          <div className="text-foreground-disabled flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                            <Calendar className="size-3" />
                            {enrollment.createdAt
                              ? `Enrolled ${formatDate(enrollment.createdAt)}`
                              : "Recently enrolled"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right content: Status & Actions */}
                    <div className="border-border/30 flex shrink-0 items-center justify-between border-t pt-4 sm:justify-end sm:gap-6 sm:border-0 sm:pt-0">
                      <div className="flex items-center gap-4">
                        {isPending && (
                          <Link
                            href="/student/payments"
                            className="text-warning text-xs font-bold tracking-widest uppercase hover:underline"
                          >
                            Pay Now &rarr;
                          </Link>
                        )}
                        <StatusBadge status={enrollment.status as string} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-border bg-surface-1/30 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center">
              <div className="bg-surface-3 shadow-inner-sm mb-6 inline-flex size-16 items-center justify-center rounded-full">
                <BookOpen className="text-foreground-disabled/40 size-8" />
              </div>
              <h3 className="font-display text-foreground text-2xl font-bold tracking-tight">
                Your journey starts here
              </h3>
              <p className="text-foreground-subtle mt-3 max-w-sm text-base">
                You haven&apos;t enrolled in any workshops yet. Explore our catalog and find your
                next skill!
              </p>
              <Button asChild className="mt-8 h-12 rounded-xl px-8 font-bold shadow-lg">
                <Link href="/workshops">
                  Browse Catalog
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </StaggerItem>

      {/* ── Section 4: Quick Actions ───────────────────────────────── */}
      <StaggerItem>
        <div className="glass hover:shadow-2 rounded-4xl p-8 shadow-sm transition-all duration-300">
          <h2 className="font-display text-foreground mb-8 text-2xl font-bold tracking-tight">
            Quick Actions
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/workshops"
              className="group border-primary/10 bg-primary-subtle/50 hover:bg-primary flex flex-col items-start gap-6 rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-white/20">
                <Search className="text-primary size-7 transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-display text-primary text-xl font-bold transition-colors group-hover:text-white">
                  Discover Workshops
                </h3>
                <p className="text-primary/70 mt-1.5 text-sm font-medium transition-colors group-hover:text-white/80">
                  Find your next favorite skill
                </p>
              </div>
            </Link>

            <Link
              href="/student/profile"
              className="group border-border bg-surface-2 hover:bg-foreground group flex flex-col items-start gap-6 rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-white/20">
                <User className="text-foreground size-7 transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-display text-foreground text-xl font-bold transition-colors group-hover:text-white">
                  Account Settings
                </h3>
                <p className="text-foreground-muted mt-1.5 text-sm font-medium transition-colors group-hover:text-white/80">
                  Manage your personal profile
                </p>
              </div>
            </Link>
          </div>
        </div>
      </StaggerItem>
    </AnimatedPage>
  );
}
