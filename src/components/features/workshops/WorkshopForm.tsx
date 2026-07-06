"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Loader2,
  Plus,
  Trash2,
  X,
  LayoutGrid,
  Calendar,
  Tags,
  Users,
  ClipboardList,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";

import {
  fetchCategories,
  fetchWorkshopLevels,
  getCategoryId,
  getLevelId,
} from "@/lib/api/services";
import type { IWorkshop, ICategory, ILevel } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────

const listItemSchema = z.string().min(1).max(200, "Item must be at most 200 characters");
const listSchema = z.array(listItemSchema).max(50).optional();

const workshopSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().max(2000, "Description must be at most 2000 characters").optional(),
  location: z.string().max(500, "Location must be at most 500 characters").optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  whatYouLearn: listSchema,
  prerequisites: listSchema,
  benefits: listSchema,
  syllabus: listSchema,
  maxSeats: z.coerce.number().min(1, "Max seats must be at least 1").max(100000).optional(),
  minAge: z.coerce.number().min(1, "Min age must be at least 1").max(150).optional(),
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
    <div className="space-y-3">
      <Label className="text-foreground text-[13px] font-bold tracking-wider uppercase">
        {label}
      </Label>

      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-surface-2 border-border focus:ring-primary/20 h-11 rounded-xl"
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="h-11 w-11 shrink-0 rounded-xl"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item, index) => (
            <div
              key={index}
              className="border-border bg-surface-2 hover:border-primary/30 flex items-center gap-2 rounded-lg border px-3 py-2 transition-all"
            >
              <span className="text-foreground text-sm font-medium">{item}</span>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => handleRemove(index)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Card Component ───────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-surface-1 rounded-3xl border p-7 shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          {icon}
        </div>
        <h2 className="font-display text-foreground text-[18px] font-bold tracking-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
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
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

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
  const handleFiles = (files: File[]) => {
    const newFiles = files.filter((file) => file.type.startsWith("image/"));

    if (newFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    if (imageFiles.length + newFiles.length + existingImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
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

    // Prepare JSON payload for the 'data' field
    const payloadData: Record<string, unknown> = {
      title: formData.title.trim(),
      level: formData.level,
      category: formData.category,
    };

    if (formData.description) payloadData.description = formData.description.trim();
    if (formData.location) payloadData.location = formData.location.trim();
    if (formData.price !== undefined) payloadData.price = formData.price;
    if (formData.startDate) payloadData.startDate = formData.startDate;
    if (formData.endDate) payloadData.endDate = formData.endDate;
    if (formData.maxSeats) payloadData.maxSeats = formData.maxSeats;
    if (formData.minAge) payloadData.minAge = formData.minAge;

    if (formData.whatYouLearn && formData.whatYouLearn.length > 0)
      payloadData.whatYouLearn = formData.whatYouLearn;
    if (formData.prerequisites && formData.prerequisites.length > 0)
      payloadData.prerequisites = formData.prerequisites;
    if (formData.benefits && formData.benefits.length > 0) payloadData.benefits = formData.benefits;
    if (formData.syllabus && formData.syllabus.length > 0) payloadData.syllabus = formData.syllabus;

    if (imagesToDelete.length > 0) {
      payloadData.deleteImages = imagesToDelete;
    }

    // Append the JSON payload
    fd.append("data", JSON.stringify(payloadData));

    // Append new images
    imageFiles.forEach((file) => fd.append("files", file));

    try {
      await onSubmit(fd);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-180">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Section 1: Basic Info ──────────────────────────────────── */}
        <SectionCard title="Basic Information" icon={<LayoutGrid className="size-5" />}>
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
            >
              Workshop Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Master the Art of Minimalist UI Design"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="bg-surface-2 border-border focus:ring-primary/20 h-12 rounded-xl text-lg font-semibold"
            />
            {errors.title && <p className="text-destructive text-xs font-bold">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
            >
              Detailed Description
            </Label>
            <Textarea
              id="description"
              placeholder="What makes this workshop special? Dive into the details..."
              rows={5}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="bg-surface-2 border-border resize-none rounded-2xl p-4"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Location
              </Label>
              <Input
                id="location"
                placeholder="Online or Physical Address"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="bg-surface-2 border-border h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Price (BDT)
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold">
                  ৳
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    updateField("price", e.target.value ? Number(e.target.value) : 0)
                  }
                  className="bg-surface-2 border-border font-display h-11 rounded-xl pl-7 font-bold"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 2: Schedule ────────────────────────────────────── */}
        <SectionCard title="Schedule" icon={<Calendar className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="bg-surface-2 border-border h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="bg-surface-2 border-border h-11 rounded-xl"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: Classification ──────────────────────────────── */}
        <SectionCard title="Classification" icon={<Tags className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => updateField("category", val)}
              >
                <SelectTrigger className="bg-surface-2 border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-1 rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} className="rounded-lg">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Level
              </Label>
              <Select value={formData.level} onValueChange={(val) => updateField("level", val)}>
                <SelectTrigger className="bg-surface-2 border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-1 rounded-xl">
                  {levels.map((lvl) => (
                    <SelectItem key={lvl._id} value={lvl._id} className="rounded-lg">
                      {lvl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 4: Capacity ────────────────────────────────────── */}
        <SectionCard title="Capacity & Age" icon={<Users className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="maxSeats"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Maximum Seats
              </Label>
              <Input
                id="maxSeats"
                type="number"
                placeholder="e.g. 50"
                value={formData.maxSeats ?? ""}
                onChange={(e) =>
                  updateField("maxSeats", e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-surface-2 border-border h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="minAge"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Minimum Age
              </Label>
              <Input
                id="minAge"
                type="number"
                placeholder="e.g. 18"
                value={formData.minAge ?? ""}
                onChange={(e) =>
                  updateField("minAge", e.target.value ? Number(e.target.value) : undefined)
                }
                className="bg-surface-2 border-border h-11 rounded-xl"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Section 5: Learning Content ────────────────────────────── */}
        <SectionCard title="Learning Content" icon={<ClipboardList className="size-5" />}>
          <div className="space-y-8">
            <ListFieldEditor
              label="What You'll Learn"
              items={formData.whatYouLearn ?? []}
              onChange={(items) => updateField("whatYouLearn", items)}
              placeholder="Add a learning outcome..."
            />
            <Separator className="bg-border/50" />
            <ListFieldEditor
              label="Prerequisites"
              items={formData.prerequisites ?? []}
              onChange={(items) => updateField("prerequisites", items)}
              placeholder="Add a prerequisite..."
            />
            <Separator className="bg-border/50" />
            <ListFieldEditor
              label="Benefits"
              items={formData.benefits ?? []}
              onChange={(items) => updateField("benefits", items)}
              placeholder="Add a benefit..."
            />
            <Separator className="bg-border/50" />
            <ListFieldEditor
              label="Course Syllabus"
              items={formData.syllabus ?? []}
              onChange={(items) => updateField("syllabus", items)}
              placeholder="Add a module or topic..."
            />
          </div>
        </SectionCard>

        {/* ── Section 6: Media ───────────────────────────────────────── */}
        <SectionCard title="Workshop Media" icon={<ImageIcon className="size-5" />}>
          <div className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-10 transition-all",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-surface-2"
              )}
            >
              <input
                id="workshop-images"
                type="file"
                accept="image/*"
                multiple
                aria-label="Upload workshop images"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleImageChange}
              />
              <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-full">
                <Plus className="size-7" />
              </div>
              <p className="text-foreground mb-1 text-sm font-bold">Drag & drop images here</p>
              <p className="text-muted-foreground text-xs">
                or <span className="text-primary font-bold">click to browse</span>
              </p>
              <p className="text-muted-foreground mt-4 text-[11px] font-bold tracking-widest uppercase">
                Max 5 images • JPG, PNG, WebP
              </p>
            </div>

            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="group border-border relative aspect-video overflow-hidden rounded-xl border shadow-sm"
                  >
                    <Image
                      src={url}
                      alt="Workshop"
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label="Remove existing image"
                        onClick={() => handleRemoveExistingImage(url)}
                        className="bg-destructive flex size-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="bg-primary absolute top-2 left-2 rounded-md px-2 py-1 text-[9px] font-bold text-white uppercase shadow-sm">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                {imagePreviews.map((src, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="group border-border relative aspect-video overflow-hidden rounded-xl border shadow-sm"
                  >
                    <Image
                      src={src}
                      alt="New Image"
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label="Remove new image"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="bg-destructive flex size-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {existingImages.length === 0 && idx === 0 && (
                      <div className="bg-primary absolute top-2 left-2 rounded-md px-2 py-1 text-[9px] font-bold text-white uppercase shadow-sm">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground rounded-xl font-bold"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shadow-primary/20 h-12 rounded-xl px-8 font-bold shadow-lg"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="mr-2 size-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
