import React from "react";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-2 flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
