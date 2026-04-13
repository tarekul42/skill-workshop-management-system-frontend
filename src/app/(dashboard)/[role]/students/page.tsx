"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";

import { PageHeader, DataTable, EmptyState } from "@/components/shared";

import { getAllEnrollments, fetchWorkshops } from "@/lib/api/services";
import { formatDateTime } from "@/lib/formatters";
import { getSavedUser } from "@/lib/auth-helpers";
// ─── Props ────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Student Row ──────────────────────────────────────────────────

interface StudentRow {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  workshopTitle: string;
  enrollmentDate: string;
  status: string;
  studentCount: number;
}

// ─── Page ─────────────────────────────────────────────────────────

export default function MyStudentsPage({ params }: PageProps) {
  const [role, setRole] = useState<string>("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getSavedUser();

  useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

  useEffect(() => {
    if (!role || !user?._id) return;

    const userId = user._id;

    async function loadStudents() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all enrollments and the instructor's workshops in parallel
        const [enrollmentsRes, workshopsRes] = await Promise.allSettled([
          getAllEnrollments({ limit: 100 }),
          fetchWorkshops({ limit: 100 }),
        ]);

        const enrollments =
          enrollmentsRes.status === "fulfilled"
            ? enrollmentsRes.value.data ?? []
            : [];

        const workshops =
          workshopsRes.status === "fulfilled"
            ? workshopsRes.value.data ?? []
            : [];

        // For instructor: find workshops created by this instructor
        // createdBy can be a string (ObjectId) or an object { _id, name, email }
        const myWorkshopIds = new Set(
          workshops
            .filter((w) => {
              if (typeof w.createdBy === "string") return w.createdBy === userId;
              return w.createdBy?._id === userId;
            })
            .map((w) => w._id)
        );

        // Filter enrollments belonging to the instructor's workshops
        const myEnrollments = enrollments.filter((e) =>
          myWorkshopIds.has(e.workshop?._id)
        );

        // Build student rows
        const studentMap = new Map<string, StudentRow>();

        for (const enrollment of myEnrollments) {
          const key = `${enrollment.user?._id}-${enrollment.workshop?._id}`;

          if (!studentMap.has(key)) {
            studentMap.set(key, {
              _id: enrollment._id,
              studentName: enrollment.user?.name ?? "Unknown",
              studentEmail: enrollment.user?.email ?? "N/A",
              studentPhone: enrollment.user?.phone,
              workshopTitle: enrollment.workshop?.title ?? "Unknown",
              enrollmentDate: enrollment.createdAt,
              status: enrollment.status,
              studentCount: enrollment.studentCount ?? 1,
            });
          }
        }

        setStudents(Array.from(studentMap.values()));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [role, user?._id]);

  // ── Columns ─────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.studentName}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.studentEmail}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "studentPhone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.studentPhone ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "workshopTitle",
        header: "Workshop",
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate block text-sm">
            {row.original.workshopTitle}
          </span>
        ),
      },
      {
        accessorKey: "studentCount",
        header: "Seats",
        cell: ({ row }) => (
          <span className="text-sm text-center block">
            {row.original.studentCount}
          </span>
        ),
      },
      {
        accessorKey: "enrollmentDate",
        header: "Enrolled On",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.enrollmentDate)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const colorClass =
            status === "COMPLETE"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : status === "PENDING"
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
              : status === "CANCEL"
              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400"
              : "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400";

          return (
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
            >
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description="Students enrolled in your workshops"
      />

      {!loading && !error && students.length === 0 && (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Students will appear here once they enroll in your workshops."
        />
      )}

      {!loading && !error && students.length > 0 && (
        <DataTable
          columns={columns}
          data={students}
          isLoading={loading}
          searchKey="studentName"
          searchPlaceholder="Search students..."
          emptyMessage="No students match your search."
        />
      )}

      {!loading && error && (
        <EmptyState
          title="Failed to load students"
          description={error}
        />
      )}
    </div>
  );
}
