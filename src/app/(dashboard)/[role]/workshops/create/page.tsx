"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { WorkshopForm } from "@/components/features/workshops/WorkshopForm";
import { createWorkshop } from "@/lib/api/services";

interface PageProps {
  params: Promise<{ role: string }>;
}

export default function CreateWorkshopPage({ params }: PageProps) {
  const router = useRouter();
  const { role } = React.use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createWorkshop(formData);
      toast.success("Workshop created successfully!");
      router.push(`/${role}/workshops`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create workshop",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Workshop">
        <BackButton />
      </PageHeader>

      <WorkshopForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Workshop"
      />
    </div>
  );
}
