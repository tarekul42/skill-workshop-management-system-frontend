"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader, BackButton, FormSkeleton } from "@/components/shared";
import { WorkshopForm } from "@/components/workshops/WorkshopForm";
import {
  updateWorkshop,
  fetchWorkshopById,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshop,
} from "@/lib/api/services";
import type { IWorkshop } from "@/types";

interface PageProps {
  params: Promise<{ role: string; id: string }>;
}

export default function EditWorkshopPage({ params }: PageProps) {
  const router = useRouter();
  const { role, id: workshopId } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workshop, setWorkshop] = useState<IWorkshop | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ws, cats, lvls] = await Promise.all([
        fetchWorkshopById(workshopId),
        fetchCategories(),
        fetchWorkshopLevels(),
      ]);
      setWorkshop(enrichWorkshop(ws, cats, lvls));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load workshop",
      );
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await updateWorkshop(workshopId, formData);
      toast.success("Workshop updated successfully!");
      router.push(`/${role}/workshops`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update workshop",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Workshop">
          <BackButton />
        </PageHeader>
        <FormSkeleton fields={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Workshop">
        <BackButton />
      </PageHeader>

      <WorkshopForm
        initialData={workshop}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      />
    </div>
  );
}
