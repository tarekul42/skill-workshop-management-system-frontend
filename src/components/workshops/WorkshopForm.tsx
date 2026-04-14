"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod/v4";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { fetchCategories, fetchWorkshopLevels, getCategoryId, getLevelId } from "@/lib/api/services";
import type { IWorkshop, ICategory, ILevel } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────

const workshopSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  whatYouLearn: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  syllabus: z.array(z.string()).optional(),
  maxSeats: z.coerce.number().min(1, "Max seats must be at least 1").optional(),
  minAge: z.coerce.number().min(1, "Min age must be at least 1").optional(),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

// ─── Props ────────────────────────────────────────────────────────

interface WorkshopFormProps {
  initialData?: IWorkshop | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

// ─── List Field Editor ────────────────────────────────────────────



function ListFieldEditor({
  label,
  items,
  onChange,
  placeholder = "Enter item",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputValue("");
    }
  }, [inputValue, items, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="flex-1 truncate">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────

export function WorkshopForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Create Workshop",
}: WorkshopFormProps) {
  // ── Form state (initialize from initialData) ──────────────────
  const [formData, setFormData] = useState<WorkshopFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        location: initialData.location ?? "",
        price: initialData.price ?? 0,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        level: getLevelId(initialData.level),
        category: getCategoryId(initialData.category),
        whatYouLearn: initialData.whatYouLearn ?? [],
        prerequisites: initialData.prerequisites ?? [],
        benefits: initialData.benefits ?? [],
        syllabus: initialData.syllabus ?? [],
        maxSeats: initialData.maxSeats,
        minAge: initialData.minAge,
      };
    }
    return {
      title: "",
      description: "",
      location: "",
      price: 0,
      startDate: "",
      endDate: "",
      level: "",
      category: "",
      whatYouLearn: [],
      prerequisites: [],
      benefits: [],
      syllabus: [],
      maxSeats: undefined,
      minAge: undefined,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images ?? []
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // ── Fetch categories & levels ────────────────────────────────────
  const { data: categories = [] } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  const { data: levels = [] } = useQuery<ILevel[]>({
    queryKey: ["levels"],
    queryFn: fetchWorkshopLevels,
    staleTime: 1000 * 60 * 5,
  });

  // ── Image handling ───────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/")
    );

    if (newFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    if (imageFiles.length + newFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...newFiles]);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const preview = prev[index];
      URL.revokeObjectURL(preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setImagesToDelete((prev) => [...prev, url]);
  };

  // ── Field update helpers ─────────────────────────────────────────
  const updateField = (field: keyof WorkshopFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Validate ─────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const result = workshopSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const fd = new FormData();

    // Basic fields
    fd.append("title", formData.title);
    if (formData.description) fd.append("description", formData.description);
    if (formData.location) fd.append("location", formData.location);
    if (formData.price !== undefined)
      fd.append("price", String(formData.price));
    if (formData.startDate) fd.append("startDate", formData.startDate);
    if (formData.endDate) fd.append("endDate", formData.endDate);
    fd.append("level", formData.level);
    fd.append("category", formData.category);

    // Array fields
    formData.whatYouLearn?.forEach((item) =>
      fd.append("whatYouLearn[]", item)
    );
    formData.prerequisites?.forEach((item) =>
      fd.append("prerequisites[]", item)
    );
    formData.benefits?.forEach((item) => fd.append("benefits[]", item));
    formData.syllabus?.forEach((item) => fd.append("syllabus[]", item));

    // Number fields
    if (formData.maxSeats) fd.append("maxSeats", String(formData.maxSeats));
    if (formData.minAge) fd.append("minAge", String(formData.minAge));

    // New images
    imageFiles.forEach((file) => fd.append("files", file));

    // Images to delete (edit only)
    imagesToDelete.forEach((url) => fd.append("deleteImages[]", url));

    try {
      await onSubmit(fd);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basic Information ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Advanced Web Development Bootcamp"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your workshop in detail..."
              rows={4}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* Location & Price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Dhaka, Bangladesh"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (BDT)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={formData.price ?? ""}
                onChange={(e) =>
                  updateField("price", e.target.value ? Number(e.target.value) : 0)
                }
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Schedule ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Category & Level ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category & Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => updateField("category", val)}
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
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.level}
                onValueChange={(val) => updateField("level", val)}
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
              {errors.level && (
                <p className="text-xs text-destructive">{errors.level}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Capacity ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxSeats">Max Seats</Label>
              <Input
                id="maxSeats"
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={formData.maxSeats ?? ""}
                onChange={(e) =>
                  updateField(
                    "maxSeats",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              {errors.maxSeats && (
                <p className="text-xs text-destructive">{errors.maxSeats}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minAge">Minimum Age</Label>
              <Input
                id="minAge"
                type="number"
                min="1"
                placeholder="e.g. 18"
                value={formData.minAge ?? ""}
                onChange={(e) =>
                  updateField(
                    "minAge",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              {errors.minAge && (
                <p className="text-xs text-destructive">{errors.minAge}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Details Lists ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workshop Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ListFieldEditor
            label="What You'll Learn"
            items={formData.whatYouLearn ?? []}
            onChange={(items) => updateField("whatYouLearn", items)}
            placeholder="e.g. React fundamentals"
          />
          <Separator />
          <ListFieldEditor
            label="Prerequisites"
            items={formData.prerequisites ?? []}
            onChange={(items) => updateField("prerequisites", items)}
            placeholder="e.g. Basic HTML & CSS knowledge"
          />
          <Separator />
          <ListFieldEditor
            label="Benefits"
            items={formData.benefits ?? []}
            onChange={(items) => updateField("benefits", items)}
            placeholder="e.g. Certificate of completion"
          />
          <Separator />
          <ListFieldEditor
            label="Syllabus"
            items={formData.syllabus ?? []}
            onChange={(items) => updateField("syllabus", items)}
            placeholder="e.g. Module 1: Introduction"
          />
        </CardContent>
      </Card>

      {/* ── Images ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Images{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (max 5)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Current Images
              </p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="group relative h-24 w-24 overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={url}
                      alt={`Workshop image ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(url)}
                      className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {imagePreviews.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                New Images
              </p>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="group relative h-24 w-24 overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={src}
                      alt={`New image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="flex items-center gap-3">
            <Label
              htmlFor="workshop-images"
              className="cursor-pointer"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Plus className="size-5 text-muted-foreground" />
              </div>
            </Label>
            <Input
              id="workshop-images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-xs text-muted-foreground">
              Upload workshop cover images. JPG, PNG, WebP supported.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
