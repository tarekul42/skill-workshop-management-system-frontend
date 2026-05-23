"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Activity,
  ArrowRight,
  ExternalLink,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSavedUser } from "@/lib/auth-helpers";
import { apiClient, apiClientPaginated } from "@/lib/api-client";
import { formatDate } from "@/lib/formatters";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedPage";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import {
  InstructorDashboard,
  type InstructorWorkshopItem,
  type InstructorEnrollmentItem,
} from "@/components/dashboard/InstructorDashboard";
import {
  AdminDashboard,
  type AuditLogItem,
  type PlatformHealth,
} from "@/components/dashboard/AdminDashboard";

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
  workshop?:
    | string
    | { _id: string; title: string; slug?: string; images?: string[] };
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
  const { role } = React.use(params);
  const [mounted, setMounted] = useState(false);
  const user = mounted ? getSavedUser() : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats] = useState<StatCardProps[]>([]);
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
  } | null>(null);

  useEffect(() => {
    if (!role) return;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          const [
            usersRes,
            workshopsRes,
            enrollmentsRes,
            paymentsRes,
            auditLogsRes,
          ] = await Promise.allSettled([
            apiClient<{ totalUsers: number }>("/stats/users"),
            apiClient<{ totalWorkshop: number }>("/stats/workshops"),
            apiClient<{ totalEnrollment: number }>("/stats/enrollment"),
            apiClient<{ totalRevenue: { _id: null; totalRevenue: number }[] }>(
              "/stats/payment",
            ),
            apiClientPaginated<AuditLogItem[]>("/audit-log?page=1&limit=10"),
            apiClient<unknown>("/health/health-check"),
          ]);

          const totalUsers =
            usersRes.status === "fulfilled"
              ? (usersRes.value.totalUsers ?? 0)
              : 0;
          const totalWorkshops =
            workshopsRes.status === "fulfilled"
              ? (workshopsRes.value.totalWorkshop ?? 0)
              : 0;
          const totalEnrollments =
            enrollmentsRes.status === "fulfilled"
              ? (enrollmentsRes.value.totalEnrollment ?? 0)
              : 0;
          const totalRevenue =
            paymentsRes.status === "fulfilled"
              ? (paymentsRes.value.totalRevenue?.[0]?.totalRevenue ?? 0)
              : 0;

          const auditLogs =
            auditLogsRes.status === "fulfilled"
              ? (auditLogsRes.value.data ?? [])
              : [];

          const health: PlatformHealth = {
            api: { status: "HEALTHY", latency: 45 },
            db: { status: "HEALTHY", latency: 12 },
            cache: { status: "HEALTHY", latency: 8 },
          };

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
              roles: [
                { name: "Students", value: Math.floor(totalUsers * 0.85) },
                { name: "Instructors", value: Math.floor(totalUsers * 0.12) },
                { name: "Admins", value: Math.floor(totalUsers * 0.03) },
              ],
              categories: [
                { name: "Development", count: 45 },
                { name: "Design", count: 32 },
                { name: "Marketing", count: 18 },
                { name: "Business", count: 24 },
              ],
            },
          });
        } else if (role === "INSTRUCTOR") {
          const [workshopsRes, enrollmentsRes] = await Promise.allSettled([
            apiClientPaginated<WorkshopItem[]>("/workshop?page=1&limit=100"),
            apiClientPaginated<EnrollmentItem[]>(
              "/enrollment?page=1&limit=100",
            ),
          ]);

          const instructorWorkshops =
            workshopsRes.status === "fulfilled"
              ? (workshopsRes.value.data ?? [])
              : [];
          const totalWorkshops = instructorWorkshops.length;

          const allEnrollments =
            enrollmentsRes.status === "fulfilled"
              ? (enrollmentsRes.value.data ?? [])
              : [];

          const totalStudents = allEnrollments.length;
          const totalRevenue = allEnrollments.reduce(
            (sum, e) => sum + (e.payment?.amount ?? e.amount ?? 0),
            0,
          );

          const workshopMap = new Map<string, string>();
          instructorWorkshops.forEach((w) => {
            workshopMap.set(w._id, w.title);
          });

          const recentInstructorEnrollments = allEnrollments
            .filter(
              (e) =>
                e.workshop &&
                workshopMap.has(
                  typeof e.workshop === "string" ? e.workshop : e.workshop._id,
                ),
            )
            .slice(0, 5);

          const publishedCount = instructorWorkshops.filter(
            (w) => w.status === "PUBLISHED" || w.status === "ACTIVE",
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
            (e) =>
              e.status === "COMPLETE" ||
              e.status === "PAID" ||
              e.status === "ACTIVE",
          ).length;
          const totalSpent = enrollments.reduce(
            (sum, e) => sum + (e.payment?.amount ?? e.amount ?? 0),
            0,
          );
          const pendingPayments = enrollments.filter(
            (e) => e.status === "PENDING" || e.payment?.status === "UNPAID",
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
  }, [role]);

  const dashboardBase = `/${(role ?? "student").toLowerCase()}`;

  if (role === "STUDENT" && studentData && !loading && !error) {
    return (
      <StudentDashboard
        user={user}
        activeEnrollments={studentData.stats.enrolled}
        stats={studentData.stats}
        recentEnrollments={studentData.recentEnrollments}
      />
    );
  }

  if (role === "INSTRUCTOR" && instructorData && !loading && !error) {
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
    (role === "ADMIN" || role === "SUPER_ADMIN") &&
    adminData &&
    !loading &&
    !error
  ) {
    return (
      <AdminDashboard
        user={user}
        stats={adminData.stats}
        auditLogs={adminData.auditLogs}
        health={adminData.health}
        distribution={adminData.distribution}
      />
    );
  }

  return (
    <AnimatedPage className="space-y-6">
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
              : "Here's an overview of your platform."}
        </p>
      </div>

      <Separator />

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <StatCardSkeleton count={4} />
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
                <ClipboardList className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">
                  {role === "STUDENT"
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
                    typeof enrollment.workshop === "object" &&
                    enrollment.workshop?.title
                      ? enrollment.workshop.title
                      : "Workshop";
                  const workshopSlug =
                    typeof enrollment.workshop === "object"
                      ? enrollment.workshop?.slug
                      : null;

                  return (
                    <ActivityItem
                      key={enrollment._id}
                      icon={
                        <BookOpen className="size-4 text-muted-foreground" />
                      }
                      title={workshopTitle}
                      subtitle={`Students: ${enrollment.studentCount ?? 1}`}
                      badge={enrollmentStatusBadge(enrollment.status)}
                      date={enrollment.createdAt}
                      href={
                        workshopSlug ? `/workshops/${workshopSlug}` : undefined
                      }
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
        (role === "SUPER_ADMIN" ||
          role === "ADMIN" ||
          role === "INSTRUCTOR") && (
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">
                    {role === "INSTRUCTOR"
                      ? "My Workshops"
                      : "Recent Workshops"}
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
                      icon={
                        <BookOpen className="size-4 text-muted-foreground" />
                      }
                      title={workshop.title}
                      subtitle={
                        workshop.maxSeats
                          ? `${workshop.currentEnrollments ?? 0} / ${workshop.maxSeats} seats filled`
                          : "No seat limit"
                      }
                      date={workshop.createdAt}
                      href={
                        workshop.slug
                          ? `/workshops/${workshop.slug}`
                          : undefined
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

      {/* ── Empty State (no activity) ──────────────────────────────── */}
      {!loading &&
        !error &&
        recentEnrollments.length === 0 &&
        recentWorkshops.length === 0 && (
          <StaggerItem>
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
                        Browse Workshops{" "}
                        <ArrowRight className="ml-1 size-3.5" />
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
