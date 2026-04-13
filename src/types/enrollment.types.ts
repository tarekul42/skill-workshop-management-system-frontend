export type EnrollmentStatus = "PENDING" | "CANCEL" | "COMPLETE" | "FAILED";

export interface IEnrollment {
    _id: string;
    user: { _id: string; name: string; email: string; phone?: string };
    workshop: { _id: string; title: string; price?: number; images: string[]; location?: string; startDate?: string };
    payment?: { _id: string; amount: number; status: string; transactionId: string };
    studentCount: number;
    status: EnrollmentStatus;
    createdAt: string;
}