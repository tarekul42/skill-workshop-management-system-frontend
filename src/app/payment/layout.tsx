import React from "react";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-2 flex min-h-screen justify-center md:p-6">
      <div className="w-full">{children}</div>
    </div>
  );
}
