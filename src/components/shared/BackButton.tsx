"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// ─── Props ──────────────────────────────────────────────────────────

interface BackButtonProps {
  label?: string;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────

export function BackButton({ label = "Go Back", className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}
