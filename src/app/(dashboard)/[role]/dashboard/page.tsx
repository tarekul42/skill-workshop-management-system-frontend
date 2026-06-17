"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BookOpen,
  ClipboardList,
  Activity,
  ArrowRight,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSavedUser } from "@/lib/auth-helpers";
import { apiClient, apiClientPaginated } from "@/lib/api-client";
import { fetchAdminDashboard } from "@/lib/api/services";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/ui/animated-page";
import type {
  InstructorWorkshopItem,
  InstructorEnrollmentItem,
} from "@/components/features/dashboard/InstructorDashboard";
import type {
  AuditLogItem,
  PlatformHealth,
  AdminDashboardProps,
} from "@/components/features/dashboard/AdminDashboard";

const StudentDashboard = dynamic(() =>
  import("@/components/features/dashboard/StudentDashboard").then((m) => m.StudentDashboard)
);

const InstructorDashboard = dynamic(() =>
  import("@/components/features/dashboard/InstructorDashboard").then((m) => m.InstructorDashboard)
);

const AdminDashboard = dynamic(() =>
  import("@/components/features/dashboard/AdminDashboard").then((m) => m.AdminDashboard)
);

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

// ─── Stats API Response Types ───────────────────────────────────────

interface HealthDashboardResponse {
  status: string;
  responseTimeMs: number;
  redis: { connected: boolean };
  database: { connected: boolean; latencyMs: number };
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
          <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${iconBg ?? "bg-muted"}`}
          >
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground mt-1 text-xs">{change}</p>
      </CardContent>
    </Card>
  );
}

// ─── Status badge helper ────────────────────────────────────────────

function enrollmentStatusBadge(status?: string) {
  switch (status) {
    case "COMPLETE":
      return <Badge variant="success">Paid</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "FAILED":
      return <Badge variant="danger">Failed</Badge>;
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
    <div className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors">
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
          {badge}
        </div>
      </div>
      {date && (
        <span className="text-muted-foreground hidden shrink-0 text-xs sm:block">
          {formatDate(date)}
        </span>
      )}
      {href && <ExternalLink className="text-muted-foreground size-3.5 shrink-0" />}
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
  const role = React.use(params).role;
  const normalizedRole = role?.toUpperCase() ?? "";
  const [mounted, setMounted] = useState(false);
  const user = mounted ? getSavedUser() : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [recentEnrollments] = useState<EnrollmentItem[]>([]);
  const [recentWorkshops] = useState<WorkshopItem[]>([]);
  const [studentData, setStudentData] = useState<{
    stats: {
      enrolled: number;
      completed: number;
      totalSpent: number;
      pendingPayments: number;
    };
    recentEnrollments: EnrollmentItem[];
  } | null>(null);
  const [instructorData, setInstructorData] = useState<{
    stats: {
      totalWorkshops: number;
      totalStudents: number;
      totalRevenue: number;
      publishedCount: number;
      draftCount: number;
    };
    recentWorkshops: InstructorWorkshopItem[];
    recentEnrollments: InstructorEnrollmentItem[];
  } | null>(null);
  const [adminData, setAdminData] = useState<{
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
    trends: AdminDashboardProps["trends"];
  } | null>(null);

  useEffect(() => {
    if (!normalizedRole) return;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "ADMIN") {
          const [dashboardRes, auditLogsRes, healthRes] = await Promise.allSettled([
            fetchAdminDashboard(),
            apiClientPaginated<AuditLogItem[]>("/audit?page=1&limit=10"),
            apiClient<HealthDashboardResponse>("/health/dashboard"),
          ]);

          const usersStats = dashboardRes.status === "fulfilled" ? dashboardRes.value.users : null;
          const workshopsStats =
            dashboardRes.status === "fulfilled" ? dashboardRes.value.workshops : null;
          const enrollmentsStats =
            dashboardRes.status === "fulfilled" ? dashboardRes.value.enrollments : null;
          const paymentsStats =
            dashboardRes.status === "fulfilled" ? dashboardRes.value.payments : null;
          const trendsData = dashboardRes.status === "fulfilled" ? dashboardRes.value.trends : null;

          const totalUsers = usersStats?.totalUsers ?? 0;
          const totalWorkshops = workshopsStats?.totalWorkshop ?? 0;
          const totalEnrollments = enrollmentsStats?.totalEnrollment ?? 0;
          const totalRevenue = paymentsStats?.totalRevenue?.[0]?.totalRevenue ?? 0;

          const auditLogs =
            auditLogsRes.status === "fulfilled" ? (auditLogsRes.value.data ?? []) : [];

          // Health from real /health/dashboard endpoint
          const healthRaw = healthRes.status === "fulfilled" ? healthRes.value : null;
          const health: PlatformHealth = {
            api: {
              status: healthRaw?.status === "healthy" ? "HEALTHY" : "DEGRADED",
              latency: healthRaw?.responseTimeMs ?? 0,
            },
            db: {
              status: healthRaw?.database?.connected ? "HEALTHY" : "DOWN",
              latency: healthRaw?.database?.latencyMs ?? 0,
            },
            cache: { status: healthRaw?.redis?.connected ? "HEALTHY" : "DOWN", latency: 0 },
          };

          // Role distribution from real usersByRole data
          const usersByRole = usersStats?.usersByRole ?? [];
          const roles =
            usersByRole.length > 0
              ? usersByRole.map((r: { _id: string; count: number }) => ({
                  name: r._id.charAt(0) + r._id.slice(1).toLowerCase().replace(/_/g, " "),
                  value: r.count,
                }))
              : [{ name: "Students", value: Math.max(1, totalUsers) }];

          // Category distribution from real totalWorkshopByCategory data
          const categoriesData = workshopsStats?.totalWorkshopByCategory ?? [];
          const categories = categoriesData.map((c: { _id: string; count: number }) => ({
            name: c._id,
            count: c.count,
          }));

          // Trends data
          const trends = trendsData;

          setAdminData({
            stats: {
              totalUsers,
              totalWorkshops,
              totalRevenue,
              totalEnrollments,
            },
            auditLogs,
            health,
            distribution: {
              roles,
              categories,
            },
            trends,
          });

          setStats([
            {
              icon: <Users className="text-primary size-4" />,
              label: "Total Users",
              value: totalUsers.toLocaleString(),
              change: `${usersStats?.newUsersInLastSevenDays ?? 0} new this week`,
              iconBg: "bg-primary-subtle",
            },
            {
              icon: <BookOpen className="text-success size-4" />,
              label: "Workshops",
              value: totalWorkshops.toLocaleString(),
              change: `${totalWorkshops} active`,
              iconBg: "bg-success-subtle",
            },
            {
              icon: <DollarSign className="text-warning size-4" />,
              label: "Revenue",
              value: formatCurrency(totalRevenue),
              change: `${paymentsStats?.totalPayment ?? 0} transactions`,
              iconBg: "bg-warning-subtle",
            },
            {
              icon: <ClipboardList className="text-info size-4" />,
              label: "Enrollments",
              value: totalEnrollments.toLocaleString(),
              change: `${enrollmentsStats?.enrollmentsLastSevenDays ?? 0} enrolled this week`,
              iconBg: "bg-info-subtle",
            },
          ]);
        } else if (normalizedRole === "INSTRUCTOR") {
          const [workshopsRes, enrollmentsRes] = await Promise.allSettled([
            apiClientPaginated<WorkshopItem[]>("/workshop?page=1&limit=100"),
            apiClientPaginated<EnrollmentItem[]>("/enrollment?page=1&limit=100"),
          ]);

          const instructorWorkshops =
            workshopsRes.status === "fulfilled" ? (workshopsRes.value.data ?? []) : [];
          const totalWorkshops = instructorWorkshops.length;

          const allEnrollments =
            enrollmentsRes.status === "fulfilled" ? (enrollmentsRes.value.data ?? []) : [];

          const totalStudents = allEnrollments.length;
          const totalRevenue = allEnrollments.reduce(
            (sum, e) => sum + (e.payment?.amount ?? e.amount ?? 0),
            0
          );

          const workshopMap = new Map<string, string>();
          instructorWorkshops.forEach((w) => {
            workshopMap.set(w._id, w.title);
          });

          const recentInstructorEnrollments = allEnrollments
            .filter(
              (e) =>
                e.workshop &&
                workshopMap.has(typeof e.workshop === "string" ? e.workshop : e.workshop._id)
            )
            .slice(0, 5);

          const publishedCount = instructorWorkshops.filter(
            (w) => w.status === "PUBLISHED" || w.status === "ACTIVE"
          ).length;
          const draftCount = totalWorkshops - publishedCount;

          setInstructorData({
            stats: {
              totalWorkshops,
              totalStudents,
              totalRevenue,
              publishedCount,
              draftCount,
            },
            recentWorkshops: instructorWorkshops.slice(0, 5).map((w) => ({
              _id: w._id,
              title: w.title,
              slug: w.slug,
              currentEnrollments: w.currentEnrollments,
              maxSeats: w.maxSeats,
              status: w.status,
              createdAt: w.createdAt,
            })),
            recentEnrollments: recentInstructorEnrollments.map((e) => ({
              _id: e._id,
              studentName: "Student",
              workshopTitle:
                typeof e.workshop === "object"
                  ? e.workshop.title
                  : workshopMap.get(e.workshop as string) || "Workshop",
              date: e.createdAt || "",
              status: e.status || "PENDING",
            })),
          });
        } else if (normalizedRole === "STUDENT") {
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
            (e) => e.status === "COMPLETE" || e.status === "PAID" || e.status === "ACTIVE"
          ).length;
          const totalSpent = enrollments.reduce(
            (sum, e) => sum + (e.payment?.amount ?? e.amount ?? 0),
            0
          );
          const pendingPayments = enrollments.filter(
            (e) => e.status === "PENDING" || e.payment?.status === "UNPAID"
          ).length;

          setStudentData({
            stats: {
              enrolled: totalEnrollments,
              completed: completedCount,
              totalSpent,
              pendingPayments,
            },
            recentEnrollments: enrollments.slice(0, 5),
          });
        }
      } catch {
        setError("Unable to load statistics");
      } finally {
        setLoading(false);
      }
    }

    // Pure fix: Defer to next tick to satisfy "no synchronous setState in effect" lint rule.
    const timer = setTimeout(() => setMounted(true), 0);
    loadDashboard();
    return () => clearTimeout(timer);
  }, [role, normalizedRole]);

  const dashboardBase = `/${normalizedRole.toLowerCase()}`;

  if (normalizedRole === "STUDENT" && studentData && !loading && !error) {
    return (
      <StudentDashboard
        user={user}
        activeEnrollments={studentData.stats.enrolled}
        stats={studentData.stats}
        recentEnrollments={studentData.recentEnrollments}
      />
    );
  }

  if (normalizedRole === "INSTRUCTOR" && instructorData && !loading && !error) {
    return (
      <InstructorDashboard
        user={user}
        stats={instructorData.stats}
        recentWorkshops={instructorData.recentWorkshops}
        recentEnrollments={instructorData.recentEnrollments}
      />
    );
  }

  if (
    (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") &&
    adminData &&
    !loading &&
    !error
  ) {
    return (
      <AdminDashboard
        user={user}
        stats={adminData.stats}
        auditLogs={adminData.auditLogs}
        auditBase={`${dashboardBase}/audit-logs`}
        health={adminData.health}
        distribution={adminData.distribution}
        trends={adminData.trends}
      />
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name ?? "User"}!</h1>
        <p className="text-muted-foreground">
          {normalizedRole === "STUDENT"
            ? "Track your workshop enrollments and progress."
            : normalizedRole === "INSTRUCTOR"
              ? "Monitor your workshops, students, and revenue."
              : "Here's an overview of your platform."}
        </p>
      </div>

      <Separator />

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <StatCardSkeleton count={4} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
            <Activity className="text-muted-foreground size-5" />
          </div>
          <p className="text-destructive text-sm font-medium">{error}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Please try again later or contact support.
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                iconBg={stat.iconBg}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ── Recent Enrollments (Students & Instructors) ────────────── */}
      {!loading && !error && recentEnrollments.length > 0 && (
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-muted-foreground size-4" />
                <CardTitle className="text-base">
                  {normalizedRole === "STUDENT"
                    ? "My Recent Enrollments"
                    : "Recent Student Enrollments"}
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
                      icon={<BookOpen className="text-muted-foreground size-4" />}
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
        </StaggerItem>
      )}

      {/* ── Recent Workshops (Admin & Instructors) ─────────────────── */}
      {!loading &&
        !error &&
        recentWorkshops.length > 0 &&
        (normalizedRole === "SUPER_ADMIN" ||
          normalizedRole === "ADMIN" ||
          normalizedRole === "INSTRUCTOR") && (
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground size-4" />
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
                      icon={<BookOpen className="text-muted-foreground size-4" />}
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
          </StaggerItem>
        )}

      {/* ── Empty State (no activity) ──────────────────────────────── */}
      {!loading && !error && recentEnrollments.length === 0 && recentWorkshops.length === 0 && (
        <StaggerItem>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="text-muted-foreground size-4" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
                  <ClipboardList className="text-muted-foreground size-5" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {role === "STUDENT" ? "No enrollments yet" : "No recent activity"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
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
        </StaggerItem>
      )}
    </AnimatedPage>
  );
}
