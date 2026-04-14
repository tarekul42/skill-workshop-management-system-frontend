"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHeader, BackButton, FormSkeleton } from "@/components/shared";
import { createWorkshop } from "@/lib/api/services";
import { fetchCategories } from "@/lib/api/services";
import { fetchWorkshopLevels } from "@/lib/api/services";
import type { ICategory, ILevel } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Validation ──────────────────────────────────────────────────────

function validateForm(data: WorkshopFormData): string[] {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push("Title is required");
  return errors;
}

// ─── Form Data Type ──────────────────────────────────────────────────

interface WorkshopFormData {
  title: string;
  description: string;
  location: string;
  price: string;
  startDate: string;
  endDate: string;
  levelId: string;
  categoryId: string;
  whatYouLearn: string[];
  prerequisites: string[];
  benefits: string[];
  syllabus: string[];
  maxSeats: string;
  minAge: string;
  files: File[];
}

// ─── Component ───────────────────────────────────────────────────────

export default function CreateWorkshopPage({ params }: PageProps) {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  // Loading states
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reference data
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [levels, setLevels] = useState<ILevel[]>([]);

  // Form state
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: "",
    description: "",
    location: "",
    price: "",
    startDate: "",
    endDate: "",
    levelId: "",
    categoryId: "",
    whatYouLearn: [""],
    prerequisites: [""],
    benefits: [""],
    syllabus: [""],
    maxSeats: "",
    minAge: "",
    files: [],
  });

  useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

  // ── Fetch categories and levels ───────────────────────────────────

  const fetchMetaData = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [cats, lvls] = await Promise.all([
        fetchCategories(),
        fetchWorkshopLevels(),
      ]);
      setCategories(cats);
      setLevels(lvls);
    } catch {
      // Error handled silently
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  // ── Field updaters ────────────────────────────────────────────────

  const updateField = (field: keyof WorkshopFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateListItem = (
    field: "whatYouLearn" | "prerequisites" | "benefits" | "syllabus",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (
    field: "whatYouLearn" | "prerequisites" | "benefits" | "syllabus",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeListItem = (
    field: "whatYouLearn" | "prerequisites" | "benefits" | "syllabus",
    index: number,
  ) => {
    setFormData((prev) => {
      if (prev[field].length <= 1) return prev;
      const list = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: list };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...Array.from(fileList)],
      }));
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      if (formData.description.trim())
        fd.append("description", formData.description.trim());
      if (formData.location.trim())
        fd.append("location", formData.location.trim());
      if (formData.price) fd.append("price", formData.price);
      if (formData.startDate) fd.append("startDate", formData.startDate);
      if (formData.endDate) fd.append("endDate", formData.endDate);
      if (formData.levelId) fd.append("level", formData.levelId);
      if (formData.categoryId) fd.append("category", formData.categoryId);
      if (formData.maxSeats) fd.append("maxSeats", formData.maxSeats);
      if (formData.minAge) fd.append("minAge", formData.minAge);

      // Dynamic lists — only send non-empty items
      const whatYouLearn = formData.whatYouLearn.filter((s) => s.trim());
      const prerequisites = formData.prerequisites.filter((s) => s.trim());
      const benefits = formData.benefits.filter((s) => s.trim());
      const syllabus = formData.syllabus.filter((s) => s.trim());

      whatYouLearn.forEach((item) => fd.append("whatYouLearn[]", item));
      prerequisites.forEach((item) => fd.append("prerequisites[]", item));
      benefits.forEach((item) => fd.append("benefits[]", item));
      syllabus.forEach((item) => fd.append("syllabus[]", item));

      // Files
      formData.files.forEach((file) => fd.append("files", file));

      await createWorkshop(fd);
      toast.success("Workshop created successfully!");
      router.push(`/${role}/workshops`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create workshop",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  if (loadingMeta) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create Workshop">
          <BackButton />
        </PageHeader>
        <FormSkeleton fields={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Workshop">
        <BackButton />
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter workshop title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the workshop..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Workshop location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (BDT)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSeats">Max Seats</Label>
                <Input
                  id="maxSeats"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.maxSeats}
                  onChange={(e) => updateField("maxSeats", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAge">Min Age</Label>
                <Input
                  id="minAge"
                  type="number"
                  min="0"
                  placeholder="No minimum"
                  value={formData.minAge}
                  onChange={(e) => updateField("minAge", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={formData.levelId}
                  onValueChange={(v) => updateField("levelId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl._id} value={lvl._id}>
                        {lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => updateField("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Dynamic Lists ─────────────────────────────────────────── */}
        <DynamicListSection
          title="What You'll Learn"
          items={formData.whatYouLearn}
          onUpdate={(idx, val) => updateListItem("whatYouLearn", idx, val)}
          onAdd={() => addListItem("whatYouLearn")}
          onRemove={(idx) => removeListItem("whatYouLearn", idx)}
        />
        <DynamicListSection
          title="Prerequisites"
          items={formData.prerequisites}
          onUpdate={(idx, val) => updateListItem("prerequisites", idx, val)}
          onAdd={() => addListItem("prerequisites")}
          onRemove={(idx) => removeListItem("prerequisites", idx)}
        />
        <DynamicListSection
          title="Benefits"
          items={formData.benefits}
          onUpdate={(idx, val) => updateListItem("benefits", idx, val)}
          onAdd={() => addListItem("benefits")}
          onRemove={(idx) => removeListItem("benefits", idx)}
        />
        <DynamicListSection
          title="Syllabus"
          items={formData.syllabus}
          onUpdate={(idx, val) => updateListItem("syllabus", idx, val)}
          onAdd={() => addListItem("syllabus")}
          onRemove={(idx) => removeListItem("syllabus", idx)}
        />

        {/* ── Images ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workshop Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="images" className="sr-only">
                Upload images
              </Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="max-w-xs"
              />
              <span className="text-xs text-muted-foreground">
                {formData.files.length} file(s) selected
              </span>
            </div>
            {formData.files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="truncate max-w-37.5">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeFile(idx)}
                      className="size-5 text-muted-foreground hover:text-red-600"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? "Creating..." : "Create Workshop"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Dynamic List Section ─────────────────────────────────────────────

function DynamicListSection({
  title,
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder={`Enter ${title.toLowerCase()} item...`}
              value={item}
              onChange={(e) => onUpdate(idx, e.target.value)}
              className="flex-1"
            />
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(idx)}
                className="shrink-0 text-muted-foreground hover:text-red-600"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
