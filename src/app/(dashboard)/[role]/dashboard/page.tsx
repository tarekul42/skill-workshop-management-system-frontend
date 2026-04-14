"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  DollarSign,
  ClipboardList,
  Trophy,
  CreditCard,
  Award,
  Activity,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getSavedUser } from "@/lib/auth-helpers";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/formatters";

// ─── Props ──────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Enrollment type ─────────────────────────────────────────────────

interface EnrollmentItem {
  status?: string;
  payment?: { amount?: number };
  amount?: number;
}

// ─── Stat Card ──────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}

function StatCard({ icon, label, value, change }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton Cards ─────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
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

// ─── Dashboard Page ─────────────────────────────────────────────────

export default function DashboardPage({ params }: PageProps) {
  const [role, setRole] = React.useState<string>("STUDENT");
  const user = getSavedUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatCardProps[]>([]);

  React.useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

  useEffect(() => {
    if (!role) return;

    async function loadStats() {
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

          setStats([
            {
              icon: <BookOpen className="size-4 text-primary" />,
              label: "Total Workshops",
              value: String(totalWorkshops),
              change: "Platform total",
            },
            {
              icon: <Users className="size-4 text-primary" />,
              label: "Total Students",
              value: String(totalUsers),
              change: "Platform total",
            },
            {
              icon: <DollarSign className="size-4 text-primary" />,
              label: "Total Revenue",
              value: formatCurrency(totalRevenue),
              change: "Platform total",
            },
            {
              icon: <ClipboardList className="size-4 text-primary" />,
              label: "Active Enrollments",
              value: String(totalEnrollments),
              change: "Platform total",
            },
          ]);
        } else if (role === "INSTRUCTOR") {
          const workshopsRes = await Promise.allSettled([
            apiClient<{ total: number }>("/stats/workshops"),
          ]);

          const totalWorkshops =
            workshopsRes[0].status === "fulfilled"
              ? workshopsRes[0].value.total ?? 0
              : 0;

          if (workshopsRes[0].status === "rejected") {
            setError("Unable to load statistics");
            return;
          }

          setStats([
            {
              icon: <BookOpen className="size-4 text-primary" />,
              label: "Total Workshops",
              value: String(totalWorkshops),
              change: "Available on platform",
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

          setStats([
            {
              icon: <BookOpen className="size-4 text-primary" />,
              label: "Enrolled",
              value: String(totalEnrollments),
              change: "Total enrollments",
            },
            {
              icon: <Trophy className="size-4 text-primary" />,
              label: "Completed",
              value: String(completedCount),
              change: "Workshops completed",
            },
            {
              icon: <CreditCard className="size-4 text-primary" />,
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              change: "All time",
            },
            {
              icon: <Award className="size-4 text-primary" />,
              label: "Certificates",
              value: String(completedCount),
              change: "Earned certificates",
            },
          ]);
        }
      } catch {
        setError("Unable to load statistics");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [role]);

  return (
    <div className="space-y-6">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name ?? "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your workshops today.
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
            />
          ))}
        </div>
      )}

      {/* ── Recent Activity ────────────────────────────────────────── */}
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
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as you use the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
