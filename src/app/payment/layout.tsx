import React from "react";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {children}
      </div>
    </div>
  );
}
