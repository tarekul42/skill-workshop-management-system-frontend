export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

export interface IPayment {
  _id: string;
  enrollment: string;
  transactionId: string;
  amount: number;
  paymentGatewayData?: Record<string, unknown>;
  invoiceUrl?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
