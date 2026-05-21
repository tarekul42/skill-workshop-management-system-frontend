"use client";

import React, { useEffect, useState } from "react";
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
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedPage";

export interface DashboardEnrollmentItem {
  _id: string;
  status?: string;
  payment?: { amount?: number; status?: string };
  amount?: number;
  workshop?:
    | string
    | { _id: string; title: string; slug?: string; images?: string[] };
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
              {activeEnrollments > 0
                ? `You have ${activeEnrollments} active enrollment${activeEnrollments === 1 ? "" : "s"}.`
                : "You haven't enrolled in any workshops yet. Browse what's available!"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 shrink-0">
            <Button asChild size="lg" className="rounded-[10px] font-display shadow-sm group">
              <Link href="/workshops">
                Browse Workshops
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Cards ─────────────────────────────────── */}
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Enrolled */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Enrolled
              </p>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-primary-subtle">
                <BookOpen className="size-5 text-primary" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold text-foreground">
              <AnimatedNumber value={stats.enrolled} />
            </div>
          </div>
        </StaggerItem>

        {/* Completed */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Completed
              </p>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-success-subtle">
                <CheckCircle className="size-5 text-success" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold text-foreground">
              <AnimatedNumber value={stats.completed} />
            </div>
          </div>
        </StaggerItem>

        {/* Total Spent */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Spent
              </p>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-accent-subtle">
                <Banknote className="size-5 text-accent-foreground" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold text-foreground tracking-tight">
              <AnimatedNumber value={stats.totalSpent} isCurrency />
            </div>
          </div>
        </StaggerItem>

        {/* Pending Payments */}
        <StaggerItem>
          <div className="rounded-[16px] border border-border bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Payments
              </p>
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-warning-subtle">
                <Clock className="size-5 text-warning" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold text-foreground">
              <AnimatedNumber value={stats.pendingPayments} />
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: My Recent Enrollments ───────────────────────── */}
      <StaggerItem>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            My Recent Enrollments
          </h2>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/student/enrollments">
              View All <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        {recentEnrollments.length > 0 ? (
          <div className="space-y-3">
            {recentEnrollments.map((enrollment) => {
              const workshopTitle =
                typeof enrollment.workshop === "object" && enrollment.workshop?.title
                  ? enrollment.workshop.title
                  : "Workshop";
              const workshopSlug =
                typeof enrollment.workshop === "object" ? enrollment.workshop?.slug : null;

              const isPending = enrollment.status === "PENDING" || enrollment.payment?.status === "UNPAID";

              return (
                <div
                  key={enrollment._id}
                  className="flex flex-col gap-4 rounded-[14px] border border-border bg-surface-1 p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
                >
                  {/* Left content: Image & Info */}
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex size-[60px] shrink-0 items-center justify-center rounded-[10px] bg-surface-3 overflow-hidden">
                      <BookOpen className="size-6 text-muted-foreground/50" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={workshopSlug ? `/workshops/${workshopSlug}` : "#"}
                        className="font-body text-base font-semibold text-foreground line-clamp-1 hover:underline"
                      >
                        {workshopTitle}
                      </Link>
                      <p className="mt-1 font-body text-[13px] text-muted-foreground">
                        {enrollment.createdAt ? `Enrolled ${formatDate(enrollment.createdAt)}` : "Recently enrolled"}
                      </p>
                    </div>
                  </div>

                  {/* Right content: Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end sm:gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                      {isPending && (
                        <Link
                          href={`/checkout/${enrollment._id}`}
                          className="font-body text-[13px] font-semibold text-warning hover:underline"
                        >
                          Complete Payment &rarr;
                        </Link>
                      )}
                      <StatusBadge status={enrollment.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            {/* Simple Geometric SVG Placeholder */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-6 opacity-80"
            >
              <rect x="20" y="20" width="80" height="80" rx="20" fill="var(--surface-2)" />
              <path
                d="M45 50h30M45 60h30M45 70h20"
                stroke="var(--border-strong)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="85" cy="85" r="16" fill="var(--primary-subtle)" />
              <path
                d="M80 85l3 3 7-7"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="font-display text-xl font-bold text-foreground">
              You haven&apos;t enrolled yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start your learning journey by exploring our catalog.
            </p>
            <Button asChild className="mt-6 rounded-[10px] font-display">
              <Link href="/workshops">
                Browse available workshops <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </StaggerItem>

      {/* ── Section 4: Quick Actions ───────────────────────────────── */}
      <StaggerItem>
        <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/workshops"
            className="group flex flex-col items-start gap-4 rounded-[14px] border border-primary/20 bg-primary-subtle p-5 transition-all duration-200 hover:bg-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/50 transition-colors group-hover:bg-white/20">
              <Search className="size-6 text-primary transition-colors group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-body text-[15px] font-semibold text-primary transition-colors group-hover:text-white">
                Browse New Workshops
              </h3>
              <p className="mt-1 font-body text-[13px] text-primary/70 transition-colors group-hover:text-white/80">
                Discover your next skill
              </p>
            </div>
          </Link>

          <Link
            href="/student/payments"
            className="group flex flex-col items-start gap-4 rounded-[14px] border border-primary/20 bg-primary-subtle p-5 transition-all duration-200 hover:bg-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/50 transition-colors group-hover:bg-white/20">
              <FileText className="size-6 text-primary transition-colors group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-body text-[15px] font-semibold text-primary transition-colors group-hover:text-white">
                Download Certificates
              </h3>
              <p className="mt-1 font-body text-[13px] text-primary/70 transition-colors group-hover:text-white/80">
                View your achievements
              </p>
            </div>
          </Link>

          <Link
            href="/student/profile"
            className="group flex flex-col items-start gap-4 rounded-[14px] border border-primary/20 bg-primary-subtle p-5 transition-all duration-200 hover:bg-primary hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/50 transition-colors group-hover:bg-white/20">
              <User className="size-6 text-primary transition-colors group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-body text-[15px] font-semibold text-primary transition-colors group-hover:text-white">
                Update Profile
              </h3>
              <p className="mt-1 font-body text-[13px] text-primary/70 transition-colors group-hover:text-white/80">
                Manage your account
              </p>
            </div>
          </Link>
        </div>
      </StaggerItem>
    </AnimatedPage>
  );
}

// Custom StatusBadge matching the blueprint
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toUpperCase();

  if (s === "PENDING" || s === "PENDING_PAYMENT") {
    return (
      <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-warning-subtle px-2.5 font-body text-[12px] font-semibold tracking-[0.02em] text-warning">
        <span className="size-1.5 rounded-full bg-warning"></span>
        {status}
      </div>
    );
  }
  if (s === "COMPLETE" || s === "PAID" || s === "ACTIVE") {
    return (
      <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-success-subtle px-2.5 font-body text-[12px] font-semibold tracking-[0.02em] text-success">
        <span className="size-1.5 rounded-full bg-success"></span>
        {status}
      </div>
    );
  }
  if (s === "CANCEL" || s === "FAILED" || s === "BLOCKED") {
    return (
      <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-danger-subtle px-2.5 font-body text-[12px] font-semibold tracking-[0.02em] text-danger">
        <span className="size-1.5 rounded-full bg-danger"></span>
        {status}
    </div>
    );
  }
  return (
    <div className="inline-flex h-6 items-center gap-1.5 rounded-[6px] bg-surface-3 px-2.5 font-body text-[12px] font-semibold tracking-[0.02em] text-foreground-muted">
      {status}
    </div>
  );
}
