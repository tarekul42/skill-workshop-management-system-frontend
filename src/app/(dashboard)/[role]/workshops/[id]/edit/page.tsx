"use client";

/* eslint-disable @next/next/no-img-element */

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
import {
  updateWorkshop,
  fetchCategories,
  fetchWorkshopLevels,
  fetchWorkshopById,
  enrichWorkshop,
  getLevelId,
  getCategoryId,
} from "@/lib/api/services";
import type { IWorkshop, ICategory, ILevel } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string; id: string }>;
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
  deleteImages: string[];
}

// ─── Component ───────────────────────────────────────────────────────

export default function EditWorkshopPage({ params }: PageProps) {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [workshopId, setWorkshopId] = useState<string>("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [existingWorkshop, setExistingWorkshop] = useState<IWorkshop | null>(
    null,
  );
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
    deleteImages: [],
  });

  useEffect(() => {
    params.then((p) => {
      setRole(p.role);
      setWorkshopId(p.id);
    });
  }, [params]);

  // ── Fetch workshop and metadata ───────────────────────────────────

  const fetchWorkshop = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // Fetch workshop, categories, and levels in parallel
      const [workshopRes, catsRes, lvlsRes] = await Promise.allSettled([
        fetchWorkshopById(id),
        fetchCategories(),
        fetchWorkshopLevels(),
      ]);

      if (workshopRes.status !== "fulfilled") {
        throw workshopRes.status === "rejected"
          ? workshopRes.reason
          : new Error("Failed to fetch workshop");
      }

      const cats = catsRes.status === "fulfilled" ? catsRes.value : [];
      const lvls = lvlsRes.status === "fulfilled" ? lvlsRes.value : [];
      setCategories(cats);
      setLevels(lvls);

      const ws = enrichWorkshop(workshopRes.value, cats, lvls);
      setExistingWorkshop(ws);

      setFormData({
        title: ws.title || "",
        description: ws.description || "",
        location: ws.location || "",
        price: ws.price != null ? String(ws.price) : "",
        startDate: ws.startDate ? ws.startDate.split("T")[0] : "",
        endDate: ws.endDate ? ws.endDate.split("T")[0] : "",
        levelId: getLevelId(ws.level),
        categoryId: getCategoryId(ws.category),
        whatYouLearn: ws.whatYouLearn?.length ? ws.whatYouLearn : [""],
        prerequisites: ws.prerequisites?.length ? ws.prerequisites : [""],
        benefits: ws.benefits?.length ? ws.benefits : [""],
        syllabus: ws.syllabus?.length ? ws.syllabus : [""],
        maxSeats: ws.maxSeats ? String(ws.maxSeats) : "",
        minAge: ws.minAge ? String(ws.minAge) : "",
        files: [],
        deleteImages: [],
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load workshop",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workshopId) fetchWorkshop(workshopId);
  }, [workshopId, fetchWorkshop]);

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
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      deleteImages: [...prev.deleteImages, imageUrl],
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
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

      // Dynamic lists
      const whatYouLearn = formData.whatYouLearn.filter((s) => s.trim());
      const prerequisites = formData.prerequisites.filter((s) => s.trim());
      const benefits = formData.benefits.filter((s) => s.trim());
      const syllabus = formData.syllabus.filter((s) => s.trim());

      whatYouLearn.forEach((item) => fd.append("whatYouLearn[]", item));
      prerequisites.forEach((item) => fd.append("prerequisites[]", item));
      benefits.forEach((item) => fd.append("benefits[]", item));
      syllabus.forEach((item) => fd.append("syllabus[]", item));

      // New files
      formData.files.forEach((file) => fd.append("files", file));

      // Images to delete
      formData.deleteImages.forEach((img) => fd.append("deleteImages[]", img));

      await updateWorkshop(workshopId, fd);
      toast.success("Workshop updated successfully!");
      router.push(`/${role}/workshops`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update workshop",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

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

  // Remaining images (not marked for deletion)
  const remainingImages =
    existingWorkshop?.images.filter(
      (img) => !formData.deleteImages.includes(img),
    ) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Workshop">
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

        {/* ── Existing Images ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remainingImages.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {remainingImages.map((img, idx) => (
                  <div key={idx} className="group relative">
                    <img
                      src={img}
                      alt={`Workshop image ${idx + 1}`}
                      className="h-28 w-auto rounded-md border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute -top-2 -right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No existing images.
              </p>
            )}

            {/* New file upload */}
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="new-images" className="sr-only">
                Upload new images
              </Label>
              <Input
                id="new-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="max-w-xs"
              />
              <span className="text-xs text-muted-foreground">
                {formData.files.length} new file(s) selected
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
            {submitting ? "Saving..." : "Save Changes"}
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
