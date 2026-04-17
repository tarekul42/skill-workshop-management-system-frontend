"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  PageHeader,
  ConfirmDialog,
  TableSkeleton,
  EmptyState,
} from "@/components/shared";
import { formatDate } from "@/lib/formatters";
import {
  fetchWorkshopLevels,
  createLevel,
  updateLevel,
  deleteLevel,
} from "@/lib/api/services";
import type { ILevel } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Component ───────────────────────────────────────────────────────

export default function LevelsPage({ params: _params }: PageProps) {
  void _params;
  // Data state
  const [levels, setLevels] = useState<ILevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ILevel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ILevel | null>(null);

  // Form state
  const [formName, setFormName] = useState("");

  // Mutation states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch levels ──────────────────────────────────────────────────

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkshopLevels();
      setLevels(data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLevels();
  }, [fetchLevels]);

  // ── Handlers ───────────────────────────────────────────────────────

  const openCreateDialog = () => {
    setFormName("");
    setCreateOpen(true);
  };

  const openEditDialog = (level: ILevel) => {
    setFormName(level.name);
    setEditTarget(level);
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Level name is required");
      return;
    }
    setSaving(true);
    try {
      await createLevel(formName.trim());
      setCreateOpen(false);
      setFormName("");
      fetchLevels();
      toast.success("Level created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create level",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget || !formName.trim()) {
      toast.error("Level name is required");
      return;
    }
    setSaving(true);
    try {
      await updateLevel(editTarget._id, formName.trim());
      setEditTarget(null);
      setFormName("");
      fetchLevels();
      toast.success("Level updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update level",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLevel(deleteTarget._id);
      setDeleteTarget(null);
      fetchLevels();
      toast.success("Level deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete level",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workshop Levels"
        description="Manage workshop difficulty levels"
      >
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Create Level
        </Button>
      </PageHeader>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-4">
                  <TableSkeleton rows={5} columns={3} />
                </TableCell>
              </TableRow>
            ) : levels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-48">
                  <EmptyState
                    icon={Layers}
                    title="No levels yet"
                    description="Create your first workshop level."
                    action={{
                      label: "Create Level",
                      onClick: openCreateDialog,
                    }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              levels.map((level) => (
                <TableRow key={level._id}>
                  <TableCell>
                    <span className="text-sm font-medium">{level.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(
                        level._id.includes("created")
                          ? new Date().toISOString()
                          : new Date(
                              parseInt(level._id.substring(0, 8), 16) * 1000,
                            ).toISOString(),
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(level)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(level)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Create Level Dialog ────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) setCreateOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Level</DialogTitle>
            <DialogDescription>
              Add a new workshop difficulty level
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="level-name">Level Name *</Label>
              <Input
                id="level-name"
                placeholder="e.g., Beginner, Intermediate, Advanced"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Level Dialog ──────────────────────────────────────── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Level</DialogTitle>
            <DialogDescription>Update the level name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-level-name">Level Name *</Label>
              <Input
                id="edit-level-name"
                placeholder="e.g., Beginner, Intermediate, Advanced"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={saving}
            >
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
        title="Delete Level"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Workshops using this level may be affected.`}
        onConfirm={handleDelete}
        isLoading={deleting}
        variant="destructive"
        confirmLabel="Delete Level"
      />
    </div>
  );
}
