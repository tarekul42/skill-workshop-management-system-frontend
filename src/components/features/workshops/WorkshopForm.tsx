"use client";

import React, { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  X,
  LayoutGrid,
  Calendar,
  Tags,
  Users,
  ClipboardList,
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

import {
  fetchCategories,
  fetchWorkshopLevels,
  getCategoryId,
  getLevelId,
} from "@/lib/api/services";
import { workshopSchema, type WorkshopInput } from "@/lib/validations/workshop";
import type { IWorkshop, ICategory, ILevel } from "@/types";

import { SectionCard } from "./WorkshopFormSectionCard";
import WorkshopImageUpload from "./WorkshopImageUpload";
import type { WorkshopImageUploadHandle } from "./WorkshopImageUpload";

type WorkshopFormData = WorkshopInput;

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

// ─── Component ────────────────────────────────────────────────────

export function WorkshopForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Create Workshop",
}: WorkshopFormProps) {
  const router = useRouter();
  // ── Form state (initialize from initialData) ──────────────────
  const [formData, setFormData] = useState<WorkshopFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        location: initialData.location ?? "",
        price: initialData.price,
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
      price: undefined,
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
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const imageUploadRef = useRef<WorkshopImageUploadHandle>(null);

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
    const files = imageUploadRef.current?.getFiles() ?? [];
    files.forEach((file) => fd.append("files", file));

    try {
      await onSubmit(fd);
      imageUploadRef.current?.cleanup();
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
                    updateField("price", e.target.value ? Number(e.target.value) : undefined)
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
        <WorkshopImageUpload
          ref={imageUploadRef}
          existingImages={existingImages}
          onExistingImagesChange={setExistingImages}
          imagesToDelete={imagesToDelete}
          onImagesToDeleteChange={setImagesToDelete}
        />

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
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
