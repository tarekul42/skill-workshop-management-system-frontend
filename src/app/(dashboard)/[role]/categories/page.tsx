"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ImageIcon, Loader2, Search, SlidersHorizontal, Image as ImageIcon2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  PageHeader,
  ConfirmDialog,
  CardSkeleton,
  EmptyState,
  Breadcrumbs,
} from "@/components/shared";
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
      if (formDescription.trim())
        fd.append("description", formDescription.trim());
      if (formFile) fd.append("file", formFile);

      await createCategory(fd);
      setCreateOpen(false);
      resetForm();
      fetchCategoriesData();
      toast.success("Category created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category",
      );
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
      if (formDescription.trim())
        fd.append("description", formDescription.trim());
      if (formFile) fd.append("file", formFile);

      await updateCategory(editTarget._id, fd);
      setEditTarget(null);
      resetForm();
      fetchCategoriesData();
      toast.success("Category updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category",
      );
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
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter categories ─────────────────────────────────────────────

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-2">
           <Breadcrumbs />
           <PageHeader
            title="Category Management"
            description="Organize your curriculum by defining workshop categories and domains."
          >
            <Button onClick={openCreateDialog} className="h-11 rounded-xl px-5 font-bold shadow-raised hover:shadow-float transition-all">
              <Plus className="size-4 mr-2" />
              Create Category
            </Button>
          </PageHeader>
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-1 p-4 rounded-2xl border border-border shadow-sm">
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground-disabled" />
              <Input
                placeholder="Search categories..."
                className="pl-10 h-11 rounded-xl bg-surface-2 border-transparent focus:border-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-11 rounded-xl border-dashed">
                 <SlidersHorizontal className="size-4 mr-2 text-foreground-muted" />
                 Filters
              </Button>
              <div className="hidden sm:block h-8 w-px bg-border mx-2" />
              <p className="text-sm font-bold text-foreground shrink-0">
                {filteredCategories.length} <span className="text-foreground-muted font-medium">Categories</span>
              </p>
           </div>
        </div>

        {/* ── Category Grid ──────────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-video rounded-3xl bg-surface-2 animate-shimmer" />
             ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No categories yet"
            description="Create your first category to start organizing workshops into distinct learning paths."
            action={{ label: "Create Your First Category", onClick: openCreateDialog }}
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
                  <Card className="group overflow-hidden rounded-3xl border-border bg-surface-1 transition-all duration-300 hover:shadow-float">
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-surface-2 overflow-hidden border-b border-border">
                      {cat.thumbnail ? (
                        <img
                          src={cat.thumbnail}
                          alt={cat.name}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-linear-to-br from-surface-2 to-surface-3">
                          <ImageIcon2 className="size-10 text-foreground-disabled/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon-xs"
                              className="size-8 rounded-lg shadow-raised bg-white/90 backdrop-blur-md hover:bg-white text-foreground"
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
                              className="size-8 rounded-lg shadow-raised bg-white/90 backdrop-blur-md hover:bg-danger hover:text-white text-danger"
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
                        <h3 className="truncate text-base font-bold text-foreground leading-tight">{cat.name}</h3>
                        <p className="mt-1.5 text-[13px] text-foreground-subtle line-clamp-2 min-h-[36px]">
                          {cat.description || "No description provided for this category."}
                        </p>
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/50">
                           <p className="text-[11px] font-mono font-bold text-foreground-disabled uppercase tracking-tighter">
                             SLUG: {cat.slug}
                           </p>
                           <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
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
          <DialogContent className="max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 pb-0">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                 <Plus className="size-6 text-primary" />
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
            <DialogFooter className="p-8 pt-0 flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setCreateOpen(false);
                  resetForm();
                }}
                disabled={saving}
                className="rounded-xl flex-1 h-12 font-bold"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="rounded-xl flex-1 h-12 font-bold shadow-raised">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin size-4 mr-2" />
                    Creating...
                  </>
                ) : "Create Category"}
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
          <DialogContent className="max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 pb-0">
              <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                 <Pencil className="size-5 text-accent-foreground" />
              </div>
              <DialogTitle className="text-2xl font-bold">Edit Category</DialogTitle>
              <DialogDescription className="text-foreground-subtle">
                Update the information for "{editTarget?.name}"
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
            <DialogFooter className="p-8 pt-0 flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditTarget(null);
                  resetForm();
                }}
                disabled={saving}
                className="rounded-xl flex-1 h-12 font-bold"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={saving} className="rounded-xl flex-1 h-12 font-bold shadow-raised">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin size-4 mr-2" />
                    Saving...
                  </>
                ) : "Save Changes"}
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
        <Label htmlFor="cat-name" className="text-[13px] font-bold ml-1">Category Name</Label>
        <Input
          id="cat-name"
          placeholder="e.g. Graphic Design"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-12 rounded-xl bg-surface-2 border-transparent focus:border-primary/20 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc" className="text-[13px] font-bold ml-1 text-foreground-subtle">Short Description</Label>
        <Textarea
          id="cat-desc"
          placeholder="What will students learn in this category?"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="rounded-xl bg-surface-2 border-transparent focus:border-primary/20 transition-all resize-none"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-[13px] font-bold ml-1">Cover Image</Label>
        <div className="group relative aspect-video w-full rounded-2xl border-2 border-dashed border-border bg-surface-2 overflow-hidden flex flex-col items-center justify-center transition-colors hover:border-primary/30">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button variant="secondary" size="sm" className="rounded-lg font-bold" asChild>
                    <label className="cursor-pointer">
                      <Pencil className="size-3.5 mr-2" />
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                 </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="size-12 rounded-full bg-surface-1 flex items-center justify-center mb-3">
                <ImageIcon className="size-6 text-foreground-disabled" />
              </div>
              <p className="text-sm font-bold text-foreground">Upload category thumbnail</p>
              <p className="text-xs text-foreground-disabled mt-1">PNG, JPG or WebP up to 5MB</p>
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
