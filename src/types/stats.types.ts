// ─── Stats response types ───────────────────────────────────────────

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  unverifiedUsers: number;
  byRole: Record<string, number>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export interface WorkshopStats {
  totalWorkshops: number;
  publishedWorkshops: number;
  draftWorkshops: number;
  totalSeats: number;
  totalEnrolled: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  recentWorkshops: Array<{
    _id: string;
    title: string;
    currentEnrollments: number;
    maxSeats: number;
    createdAt: string;
  }>;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  pendingEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  failedEnrollments: number;
  totalStudents: number;
  revenue: number;
  byStatus: Record<string, number>;
  recentEnrollments: Array<{
    _id: string;
    workshop: { _id: string; title: string };
    studentCount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  paidPayments: number;
  unpaidPayments: number;
  refundedPayments: number;
  failedPayments: number;
  cancelledPayments: number;
  byStatus: Record<string, number>;
  recentPayments: Array<{
    _id: string;
    transactionId: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}
