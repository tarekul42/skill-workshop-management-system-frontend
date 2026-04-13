"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

/* eslint-disable @next/next/no-img-element */
import { PageHeader, ConfirmDialog, CardSkeleton, EmptyState } from "@/components/shared";
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

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="Category Management" description="Manage workshop categories">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Create Category
        </Button>
      </PageHeader>

      {/* ── Category Grid ──────────────────────────────────────────── */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No categories yet"
          description="Create your first category to organize workshops."
          action={{ label: "Create Category", onClick: openCreateDialog }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <Card key={cat._id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video w-full bg-muted">
                {cat.thumbnail ? (
                  <img
                    src={cat.thumbnail}
                    alt={cat.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{cat.name}</h3>
                    {cat.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Slug: {cat.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEditDialog(cat)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleteTarget(cat)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Category Dialog ─────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) { setCreateOpen(false); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new workshop category</DialogDescription>
          </DialogHeader>
          <CategoryForm
            name={formName}
            description={formDescription}
            preview={formPreview}
            onNameChange={setFormName}
            onDescriptionChange={setFormDescription}
            onFileChange={handleFileChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Category Dialog ───────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) { setEditTarget(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <CategoryForm
            name={formName}
            description={formDescription}
            preview={formPreview}
            onNameChange={setFormName}
            onDescriptionChange={setFormDescription}
            onFileChange={handleFileChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTarget(null); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Workshops using this category may be affected.`}
        onConfirm={handleDelete}
        isLoading={deleting}
        variant="destructive"
        confirmLabel="Delete Category"
      />
    </div>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name *</Label>
        <Input
          id="cat-name"
          placeholder="Category name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc">Description</Label>
        <Textarea
          id="cat-desc"
          placeholder="Describe this category..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-thumbnail">Thumbnail</Label>
        <Input
          id="cat-thumbnail"
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-auto rounded-md border object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
