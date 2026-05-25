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
  FileText,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-page";
import { StatusBadge } from "@/components/ui/status-badge";

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
            <Button
              asChild
              size="lg"
              className="rounded-[10px] font-display shadow-sm group"
            >
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
          <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-3 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Enrolled
              </p>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle shadow-sm">
                <BookOpen className="size-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 font-display text-[32px] font-extrabold text-foreground leading-none">
              <AnimatedNumber value={stats.enrolled} />
            </div>
          </div>
        </StaggerItem>

        {/* Completed */}
        <StaggerItem>
          <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-3 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Completed
              </p>
              <div className="flex size-12 items-center justify-center rounded-xl bg-success-subtle shadow-sm">
                <CheckCircle className="size-6 text-success" />
              </div>
            </div>
            <div className="mt-4 font-display text-[32px] font-extrabold text-foreground leading-none">
              <AnimatedNumber value={stats.completed} />
            </div>
          </div>
        </StaggerItem>

        {/* Total Spent */}
        <StaggerItem>
          <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-3 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Spent
              </p>
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent-subtle shadow-sm">
                <Banknote className="size-6 text-accent-foreground" />
              </div>
            </div>
            <div className="mt-4 font-display text-[28px] font-extrabold text-foreground leading-none tracking-tight">
              <AnimatedNumber value={stats.totalSpent} isCurrency />
            </div>
          </div>
        </StaggerItem>

        {/* Pending Payments */}
        <StaggerItem>
          <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-3 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pending
              </p>
              <div className="flex size-12 items-center justify-center rounded-xl bg-warning-subtle shadow-sm">
                <Clock className="size-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 font-display text-[32px] font-extrabold text-foreground leading-none">
              <AnimatedNumber value={stats.pendingPayments} />
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Section 3: My Recent Enrollments ───────────────────────── */}
      <StaggerItem>
        <div className="glass rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:shadow-2">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              My Recent Enrollments
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-foreground-muted font-bold text-xs uppercase tracking-widest hover:text-primary"
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
                  typeof enrollment.workshop === "object" &&
                  enrollment.workshop?.title
                    ? enrollment.workshop.title
                    : "Workshop";
                const workshopSlug =
                  typeof enrollment.workshop === "object"
                    ? enrollment.workshop?.slug
                    : null;

                const isPending =
                  enrollment.status === "PENDING" ||
                  enrollment.payment?.status === "UNPAID";

                return (
                  <div
                    key={enrollment._id}
                    className="flex flex-col gap-5 p-5 rounded-[20px] border border-border/50 bg-background/40 hover:bg-surface-2 transition-all duration-300 hover:shadow-md group sm:flex-row sm:items-center"
                  >
                    {/* Left content: Image & Info */}
                    <div className="flex flex-1 items-center gap-5">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-3 overflow-hidden border border-border/50 transition-transform group-hover:scale-105 group-hover:rotate-3">
                        <BookOpen className="size-7 text-foreground-disabled/60" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={
                            workshopSlug ? `/workshops/${workshopSlug}` : "#"
                          }
                          className="font-display text-lg font-bold text-foreground line-clamp-1 hover:text-primary transition-colors"
                        >
                          {workshopTitle}
                        </Link>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground-disabled uppercase tracking-wide">
                            <Calendar className="size-3" />
                            {enrollment.createdAt
                              ? `Enrolled ${formatDate(enrollment.createdAt)}`
                              : "Recently enrolled"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right content: Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end sm:gap-6 shrink-0 border-t border-border/30 pt-4 sm:border-0 sm:pt-0">
                      <div className="flex items-center gap-4">
                        {isPending && (
                          <Link
                            href={`/checkout/${enrollment._id}`}
                            className="text-xs font-bold text-warning uppercase tracking-widest hover:underline"
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
            <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-border py-20 text-center bg-surface-1/30">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-surface-3 mb-6 shadow-inner-sm">
                <BookOpen className="size-8 text-foreground-disabled/40" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Your journey starts here
              </h3>
              <p className="mt-3 text-base text-foreground-subtle max-w-sm">
                You haven&apos;t enrolled in any workshops yet. Explore our
                catalog and find your next skill!
              </p>
              <Button
                asChild
                className="mt-8 h-12 rounded-xl px-8 font-bold shadow-lg"
              >
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
        <div className="glass rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:shadow-2">
          <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <Link
              href="/workshops"
              className="group flex flex-col items-start gap-6 rounded-[24px] border border-primary/10 bg-primary-subtle/50 p-6 transition-all duration-300 hover:bg-primary hover:shadow-xl"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 group-hover:-rotate-3">
                <Search className="size-7 text-primary transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-primary transition-colors group-hover:text-white">
                  Discover Workshops
                </h3>
                <p className="mt-1.5 text-sm font-medium text-primary/70 transition-colors group-hover:text-white/80">
                  Find your next favorite skill
                </p>
              </div>
            </Link>

            <Link
              href="/student/payments"
              className="group flex flex-col items-start gap-6 rounded-[24px] border border-accent/10 bg-accent-subtle/50 p-6 transition-all duration-300 hover:bg-accent hover:shadow-xl"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 group-hover:-rotate-3">
                <FileText className="size-7 text-accent-foreground transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-accent-foreground transition-colors group-hover:text-white">
                  My Certificates
                </h3>
                <p className="mt-1.5 text-sm font-medium text-accent-foreground/70 transition-colors group-hover:text-white/80">
                  Download your achievements
                </p>
              </div>
            </Link>

            <Link
              href="/student/profile"
              className="group flex flex-col items-start gap-6 rounded-[24px] border border-border bg-surface-2 p-6 transition-all duration-300 hover:bg-foreground hover:shadow-xl group"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 group-hover:-rotate-3">
                <User className="size-7 text-foreground transition-colors group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-white">
                  Account Settings
                </h3>
                <p className="mt-1.5 text-sm font-medium text-foreground-muted transition-colors group-hover:text-white/80">
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
