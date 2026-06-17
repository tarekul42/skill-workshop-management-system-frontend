"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Loader2,
  Search,
  SlidersHorizontal,
  Image as ImageIcon2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/services";
import type { ICategory } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function CategoriesPage({ params: _params }: PageProps) {
  void _params;
  // Data state
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);

  // Mutation states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch categories ──────────────────────────────────────────────

  const fetchCategoriesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  // ── Form helpers ──────────────────────────────────────────────────

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormFile(null);
    setFormPreview(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEditDialog = (cat: ICategory) => {
    setFormName(cat.name);
    setFormDescription(cat.description || "");
    setFormFile(null);
    setFormPreview(cat.thumbnail || null);
    setEditTarget(cat);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setFormPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Submit handlers ───────────────────────────────────────────────

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formName.trim());
      if (formDescription.trim()) fd.append("description", formDescription.trim());
      if (formFile) fd.append("file", formFile);

      await createCategory(fd);
      setCreateOpen(false);
      resetForm();
      fetchCategoriesData();
      toast.success("Category created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget || !formName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formName.trim());
      if (formDescription.trim()) fd.append("description", formDescription.trim());
      if (formFile) fd.append("file", formFile);

      await updateCategory(editTarget._id, fd);
      setEditTarget(null);
      resetForm();
      fetchCategoriesData();
      toast.success("Category updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      setDeleteTarget(null);
      fetchCategoriesData();
      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter categories ─────────────────────────────────────────────

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-2">
          <PageHeader
            title="Category Management"
            description="Organize your curriculum by defining workshop categories and domains."
          >
            <Button
              onClick={openCreateDialog}
              className="shadow-raised hover:shadow-float h-11 rounded-xl px-5 font-bold transition-all"
            >
              <Plus className="mr-2 size-4" />
              Create Category
            </Button>
          </PageHeader>
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="bg-surface-1 border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search className="text-foreground-disabled absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search categories..."
              className="bg-surface-2 focus:border-primary/20 h-11 rounded-xl border-transparent pl-10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button variant="outline" className="h-11 flex-1 rounded-xl border-dashed sm:flex-none">
              <SlidersHorizontal className="text-foreground-muted mr-2 size-4" />
              Filters
            </Button>
            <div className="bg-border mx-2 hidden h-8 w-px sm:block" />
            <p className="text-foreground shrink-0 text-sm font-bold">
              {filteredCategories.length}{" "}
              <span className="text-foreground-muted font-medium">Categories</span>
            </p>
          </div>
        </div>

        {/* ── Category Grid ──────────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface-2 animate-shimmer aspect-video rounded-3xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No categories yet"
            description="Create your first category to start organizing workshops into distinct learning paths."
            action={{
              label: "Create Your First Category",
              onClick: openCreateDialog,
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={cat._id}
                >
                  <Card className="group border-border bg-surface-1 hover:shadow-float overflow-hidden rounded-3xl transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="bg-surface-2 border-border relative aspect-video w-full overflow-hidden border-b">
                      {cat.thumbnail ? (
                        <Image
                          src={cat.thumbnail}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="from-surface-2 to-surface-3 flex h-full items-center justify-center bg-linear-to-br">
                          <ImageIcon2 className="text-foreground-disabled/30 size-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex translate-y-1 gap-1 opacity-0 transition-opacity duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon-xs"
                              className="shadow-raised text-foreground size-8 rounded-lg bg-white/90 backdrop-blur-md hover:bg-white"
                              onClick={() => openEditDialog(cat)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Category</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon-xs"
                              className="shadow-raised hover:bg-danger text-danger size-8 rounded-lg bg-white/90 backdrop-blur-md hover:text-white"
                              onClick={() => setDeleteTarget(cat)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Category</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="min-w-0">
                        <h3 className="text-foreground truncate text-base leading-tight font-bold">
                          {cat.name}
                        </h3>
                        <p className="text-foreground-subtle mt-1.5 line-clamp-2 min-h-0 text-[13px]">
                          {cat.description || "No description provided for this category."}
                        </p>
                        <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-4">
                          <p className="text-foreground-disabled font-mono text-[11px] font-bold tracking-tighter uppercase">
                            SLUG: {cat.slug}
                          </p>
                          <span className="text-primary bg-primary/5 border-primary/10 rounded-full border px-2 py-0.5 text-[11px] font-bold">
                            Active
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Create Category Dialog ─────────────────────────────────── */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCreateOpen(false);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-md overflow-hidden rounded-4xl border-none p-0 shadow-2xl">
            <DialogHeader className="p-8 pb-0">
              <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <Plus className="text-primary size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold">New Category</DialogTitle>
              <DialogDescription className="text-foreground-subtle">
                Define a new domain to organize your workshops.
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 pt-6">
              <CategoryForm
                name={formName}
                description={formDescription}
                preview={formPreview}
                onNameChange={setFormName}
                onDescriptionChange={setFormDescription}
                onFileChange={handleFileChange}
              />
            </div>
            <DialogFooter className="flex gap-2 p-8 pt-0">
              <Button
                variant="ghost"
                onClick={() => {
                  setCreateOpen(false);
                  resetForm();
                }}
                disabled={saving}
                className="h-12 flex-1 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="shadow-raised h-12 flex-1 rounded-xl font-bold"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Category Dialog ───────────────────────────────────── */}
        <Dialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) {
              setEditTarget(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-md overflow-hidden rounded-4xl border-none p-0 shadow-2xl">
            <DialogHeader className="p-8 pb-0">
              <div className="bg-accent/10 mb-4 flex size-12 items-center justify-center rounded-2xl">
                <Pencil className="text-accent-foreground size-5" />
              </div>
              <DialogTitle className="text-2xl font-bold">Edit Category</DialogTitle>
              <DialogDescription className="text-foreground-subtle">
                Update the information for &quot;{editTarget?.name}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 pt-6">
              <CategoryForm
                name={formName}
                description={formDescription}
                preview={formPreview}
                onNameChange={setFormName}
                onDescriptionChange={setFormDescription}
                onFileChange={handleFileChange}
              />
            </div>
            <DialogFooter className="flex gap-2 p-8 pt-0">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditTarget(null);
                  resetForm();
                }}
                disabled={saving}
                className="h-12 flex-1 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={saving}
                className="shadow-raised h-12 flex-1 rounded-xl font-bold"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ─────────────────────────────────────────── */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Category"
          description={`Are you sure you want to permanently delete the category "${deleteTarget?.name}"? This will affect any workshops currently assigned to this domain.`}
          onConfirm={handleDelete}
          isLoading={deleting}
          variant="destructive"
          confirmLabel="Delete Permanently"
        />
      </div>
    </TooltipProvider>
  );
}

// ─── Category Form ────────────────────────────────────────────────────

function CategoryForm({
  name,
  description,
  preview,
  onNameChange,
  onDescriptionChange,
  onFileChange,
}: {
  name: string;
  description: string;
  preview: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cat-name" className="ml-1 text-[13px] font-bold">
          Category Name
        </Label>
        <Input
          id="cat-name"
          placeholder="e.g. Graphic Design"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-surface-2 focus:border-primary/20 h-12 rounded-xl border-transparent transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc" className="text-foreground-subtle ml-1 text-[13px] font-bold">
          Short Description
        </Label>
        <Textarea
          id="cat-desc"
          placeholder="What will students learn in this category?"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="bg-surface-2 focus:border-primary/20 resize-none rounded-xl border-transparent transition-all"
        />
      </div>
      <div className="space-y-3">
        <Label className="ml-1 text-[13px] font-bold">Cover Image</Label>
        <div className="group border-border bg-surface-2 hover:border-primary/30 relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors">
          {preview ? (
            <>
              <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="secondary" size="sm" className="rounded-lg font-bold" asChild>
                  <label className="cursor-pointer">
                    <Pencil className="mr-2 size-3.5" />
                    Change Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onFileChange}
                    />
                  </label>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-surface-1 mb-3 flex size-12 items-center justify-center rounded-full">
                <ImageIcon className="text-foreground-disabled size-6" />
              </div>
              <p className="text-foreground text-sm font-bold">Upload category thumbnail</p>
              <p className="text-foreground-disabled mt-1 text-xs">PNG, JPG or WebP up to 5MB</p>
              <label className="absolute inset-0 cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
