export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface IAuditLog {
  _id: string;
  action: AuditAction;
  collectionName: string;
  documentId: string;
  performedBy?: { _id: string; name: string; email: string; role: string };
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
