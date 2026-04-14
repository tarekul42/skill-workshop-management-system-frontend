"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  DollarSign,
  ClipboardList,
  Trophy,
  CreditCard,
  Award,
  Activity,
  ArrowRight,
  ExternalLink,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSavedUser } from "@/lib/auth-helpers";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/formatters";

// ─── Props ──────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Enrollment type ─────────────────────────────────────────────────

interface EnrollmentItem {
  _id: string;
  status?: string;
  payment?: { amount?: number; status?: string };
  amount?: number;
  workshop?: string | { _id: string; title: string; slug?: string; images?: string[] };
  createdAt?: string;
  studentCount?: number;
}

interface WorkshopItem {
  _id: string;
  title: string;
  slug?: string;
  currentEnrollments?: number;
  maxSeats?: number;
  createdAt?: string;
  status?: string;
}

// ─── Stat Card ──────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  iconBg?: string;
}

function StatCard({ icon, label, value, change, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${iconBg ?? "bg-muted"}`}
          >
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton Cards ─────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-36" />
      </CardContent>
    </Card>
  );
}

// ─── Status badge helper ────────────────────────────────────────────

function enrollmentStatusBadge(status?: string) {
  switch (status) {
    case "COMPLETE":
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Paid</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "CANCEL":
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status ?? "Unknown"}</Badge>;
  }
}

// ─── Recent Activity Item ───────────────────────────────────────────

function ActivityItem({
  icon,
  title,
  subtitle,
  badge,
  date,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  date?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          {badge}
        </div>
      </div>
      {date && (
        <span className="hidden text-xs text-muted-foreground sm:block shrink-0">
          {formatDate(date)}
        </span>
      )}
      {href && (
        <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

// ─── Dashboard Page ─────────────────────────────────────────────────

export default function DashboardPage({ params }: PageProps) {
  const [role, setRole] = React.useState<string>("STUDENT");
  const user = getSavedUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentItem[]>([]);
  const [recentWorkshops, setRecentWorkshops] = useState<WorkshopItem[]>([]);

  React.useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

  useEffect(() => {
    if (!role) return;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          const [usersRes, workshopsRes, enrollmentsRes, paymentsRes] =
            await Promise.allSettled([
              apiClient<{ total: number }>("/stats/users"),
              apiClient<{ total: number }>("/stats/workshops"),
              apiClient<{ total: number }>("/stats/enrollment"),
              apiClient<{ total: number; totalAmount: number }>("/stats/payment"),
            ]);

          const totalUsers =
            usersRes.status === "fulfilled" ? usersRes.value.total ?? 0 : 0;
          const totalWorkshops =
            workshopsRes.status === "fulfilled"
              ? workshopsRes.value.total ?? 0
              : 0;
          const totalEnrollments =
            enrollmentsRes.status === "fulfilled"
              ? enrollmentsRes.value.total ?? 0
              : 0;
          const totalRevenue =
            paymentsRes.status === "fulfilled"
              ? paymentsRes.value.totalAmount ?? 0
              : 0;

          if (
            usersRes.status === "rejected" &&
            workshopsRes.status === "rejected" &&
            enrollmentsRes.status === "rejected" &&
            paymentsRes.status === "rejected"
          ) {
            setError("Unable to load statistics");
            return;
          }

          // Recent workshops (latest 4)
          const workshopsListRes = await Promise.allSettled([
            apiClient<{ data: WorkshopItem[] }>("/workshop?page=1&limit=4"),
          ]);
          if (workshopsListRes[0].status === "fulfilled") {
            setRecentWorkshops(workshopsListRes[0].value.data ?? []);
          }

          setStats([
            {
              icon: <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />,
              label: "Total Workshops",
              value: String(totalWorkshops),
              change: "Active on platform",
              iconBg: "bg-blue-50 dark:bg-blue-950/50",
            },
            {
              icon: <Users className="size-4 text-emerald-600 dark:text-emerald-400" />,
              label: "Total Users",
              value: String(totalUsers),
              change: "Registered users",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: <DollarSign className="size-4 text-amber-600 dark:text-amber-400" />,
              label: "Total Revenue",
              value: formatCurrency(totalRevenue),
              change: "From all payments",
              iconBg: "bg-amber-50 dark:bg-amber-950/50",
            },
            {
              icon: <ClipboardList className="size-4 text-violet-600 dark:text-violet-400" />,
              label: "Enrollments",
              value: String(totalEnrollments),
              change: "Total enrollments",
              iconBg: "bg-violet-50 dark:bg-violet-950/50",
            },
          ]);
        } else if (role === "INSTRUCTOR") {
          // Instructor stats
          const [workshopsRes, enrollmentsRes] = await Promise.allSettled([
            apiClient<{ data: WorkshopItem[]; meta: { total: number } }>("/workshop?page=1&limit=100"),
            apiClient<EnrollmentItem[]>("/enrollment?page=1&limit=100"),
          ]);

          const instructorWorkshops =
            workshopsRes.status === "fulfilled"
              ? (workshopsRes.value.data ?? [])
              : [];
          const totalWorkshops = instructorWorkshops.length;

          const allEnrollments =
            enrollmentsRes.status === "fulfilled" && Array.isArray(enrollmentsRes.value)
              ? enrollmentsRes.value
              : [];

          const totalStudents = allEnrollments.length;
          const totalRevenue = allEnrollments.reduce(
            (sum, e) => sum + (e.payment?.amount ?? e.amount ?? 0),
            0
          );

          // Get workshop titles for recent enrollments
          const workshopMap = new Map<string, string>();
          instructorWorkshops.forEach((w) => {
            workshopMap.set(w._id, w.title);
          });

          const recentInstructorEnrollments = allEnrollments
            .filter((e) => e.workshop && workshopMap.has(typeof e.workshop === "string" ? e.workshop : e.workshop._id))
            .slice(0, 5);

          setRecentEnrollments(recentInstructorEnrollments);
          setRecentWorkshops(instructorWorkshops.slice(0, 4));

          setStats([
            {
              icon: <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />,
              label: "My Workshops",
              value: String(totalWorkshops),
              change: "Created workshops",
              iconBg: "bg-blue-50 dark:bg-blue-950/50",
            },
            {
              icon: <Users className="size-4 text-emerald-600 dark:text-emerald-400" />,
              label: "Total Students",
              value: String(totalStudents),
              change: "Across all workshops",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: <DollarSign className="size-4 text-amber-600 dark:text-amber-400" />,
              label: "Revenue",
              value: formatCurrency(totalRevenue),
              change: "From enrollments",
              iconBg: "bg-amber-50 dark:bg-amber-950/50",
            },
          ]);
        } else if (role === "STUDENT") {
          const enrollmentsRes = await Promise.allSettled([
            apiClient<EnrollmentItem[]>("/enrollment/my-enrollments"),
          ]);

          const enrollments =
            enrollmentsRes[0].status === "fulfilled"
              ? Array.isArray(enrollmentsRes[0].value)
                ? enrollmentsRes[0].value
                : []
              : [];

          if (enrollmentsRes[0].status === "rejected") {
            setError("Unable to load statistics");
            return;
          }

          const totalEnrollments = enrollments.length;
          const completedCount = enrollments.filter(
            (e) => e.status === "COMPLETE"
          ).length;
          const totalSpent = enrollments.reduce(
            (sum, e) =>
              sum + (e.payment?.amount ?? e.amount ?? 0),
            0
          );

          // Recent enrollments (last 5)
          setRecentEnrollments(enrollments.slice(0, 5));

          setStats([
            {
              icon: <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />,
              label: "Enrolled",
              value: String(totalEnrollments),
              change: "Total enrollments",
              iconBg: "bg-blue-50 dark:bg-blue-950/50",
            },
            {
              icon: <Trophy className="size-4 text-emerald-600 dark:text-emerald-400" />,
              label: "Completed",
              value: String(completedCount),
              change: "Workshops completed",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: <CreditCard className="size-4 text-amber-600 dark:text-amber-400" />,
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              change: "All time",
              iconBg: "bg-amber-50 dark:bg-amber-950/50",
            },
            {
              icon: <Award className="size-4 text-violet-600 dark:text-violet-400" />,
              label: "Certificates",
              value: String(completedCount),
              change: "Earned certificates",
              iconBg: "bg-violet-50 dark:bg-violet-950/50",
            },
          ]);
        }
      } catch {
        setError("Unable to load statistics");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [role]);

  const dashboardBase = `/${(role ?? "student").toLowerCase()}`;

  return (
    <div className="space-y-6">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name ?? "User"}!
        </h1>
        <p className="text-muted-foreground">
          {role === "STUDENT"
            ? "Track your workshop enrollments and progress."
            : role === "INSTRUCTOR"
              ? "Monitor your workshops, students, and revenue."
              : "Here&apos;s an overview of your platform."}
        </p>
      </div>

      <Separator />

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
            <Activity className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try again later or contact support.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              iconBg={stat.iconBg}
            />
          ))}
        </div>
      )}

      {/* ── Recent Enrollments (Students & Instructors) ────────────── */}
      {!loading && !error && recentEnrollments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {role === "STUDENT" ? "My Recent Enrollments" : "Recent Student Enrollments"}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${dashboardBase}/enrollments`}>
                View All <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEnrollments.map((enrollment) => {
                const workshopTitle =
                  typeof enrollment.workshop === "object" && enrollment.workshop?.title
                    ? enrollment.workshop.title
                    : "Workshop";
                const workshopSlug =
                  typeof enrollment.workshop === "object" ? enrollment.workshop?.slug : null;

                return (
                  <ActivityItem
                    key={enrollment._id}
                    icon={<BookOpen className="size-4 text-muted-foreground" />}
                    title={workshopTitle}
                    subtitle={`Students: ${enrollment.studentCount ?? 1}`}
                    badge={enrollmentStatusBadge(enrollment.status)}
                    date={enrollment.createdAt}
                    href={workshopSlug ? `/workshops/${workshopSlug}` : undefined}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Workshops (Admin & Instructors) ─────────────────── */}
      {!loading && !error && recentWorkshops.length > 0 && (role === "SUPER_ADMIN" || role === "INSTRUCTOR") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {role === "INSTRUCTOR" ? "My Workshops" : "Recent Workshops"}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${dashboardBase}/workshops`}>
                View All <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWorkshops.map((workshop) => (
                <ActivityItem
                  key={workshop._id}
                  icon={<BookOpen className="size-4 text-muted-foreground" />}
                  title={workshop.title}
                  subtitle={
                    workshop.maxSeats
                      ? `${workshop.currentEnrollments ?? 0} / ${workshop.maxSeats} seats filled`
                      : "No seat limit"
                  }
                  date={workshop.createdAt}
                  href={workshop.slug ? `/workshops/${workshop.slug}` : undefined}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Empty State (no activity) ──────────────────────────────── */}
      {!loading && !error && recentEnrollments.length === 0 && recentWorkshops.length === 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                <ClipboardList className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {role === "STUDENT"
                  ? "No enrollments yet"
                  : "No recent activity"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {role === "STUDENT"
                  ? "Browse workshops and enroll to get started!"
                  : "Activity will appear here as you use the platform."}
              </p>
              {role === "STUDENT" && (
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/workshops">
                    Browse Workshops <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
