"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  TableSkeleton,
} from "@/components/shared";
import { formatDate, getInitials } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/utils/masking";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "@/lib/api/services";
import type { IUser, UserRole, IsActive, PaginatedResponse } from "@/types";

// ─── Page Props ──────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Role badge colors ───────────────────────────────────────────────

const roleColors: Record<UserRole, string> = {
  SUPER_ADMIN:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  ADMIN:
    "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  INSTRUCTOR:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  STUDENT:
    "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

// ─── Component ───────────────────────────────────────────────────────

export default function UsersPage({ params }: PageProps) {
  const { role: dashboardRole } = React.use(params);
  const queryClient = useQueryClient();

  // Search/Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Dialogs state
  const [viewUser, setViewUser] = useState<IUser | null>(null);
  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("STUDENT");
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [toggleTarget, setToggleTarget] = useState<IUser | null>(null);

  // ── Queries ───────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, limit, searchTerm }],
    queryFn: () => getAllUsers({ page, limit, searchTerm }),
    enabled: !!dashboardRole,
  });

  const users = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage || 1;
  const total = meta?.total || 0;

  // ── Mutations ─────────────────────────────────────────────────────

  // 1. Update Role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
      toast.success("User role updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    },
  });

  // 2. Toggle Status (Optimistic Update)
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: IsActive }) =>
      updateUser(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(["users", { page, limit, searchTerm }]);

      // Optimistically update to the new value
      queryClient.setQueryData(["users", { page, limit, searchTerm }], (old: PaginatedResponse<IUser>) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((user) =>
            user._id === id ? { ...user, isActive } : user
          ),
        };
      });

      return { previousUsers };
    },
    onError: (err, __, context) => {
      // Rollback to the previous value on error
      if (context?.previousUsers) {
        queryClient.setQueryData(["users", { page, limit, searchTerm }], context.previousUsers);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update user status");
    },
    onSuccess: (_, variables) => {
      setToggleTarget(null);
      toast.success(
        variables.isActive === "BLOCKED" ? "User blocked successfully" : "User activated successfully"
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // 3. Delete User
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    },
  });

  // ── Debounce search ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setInputValue(value);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const user = await getUserById(userId);
      setViewUser(user);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load user details");
    }
  };

  const handleEditRoleOpen = (user: IUser) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const handleEditRoleSave = () => {
    if (!editUser) return;
    updateRoleMutation.mutate({ id: editUser._id, role: editRole });
  };

  const handleToggleActive = () => {
    if (!toggleTarget) return;
    const newStatus: IsActive =
      toggleTarget.isActive === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    toggleStatusMutation.mutate({ id: toggleTarget._id, isActive: newStatus });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id);
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all registered users"
      />

      {/* ── Search & Info ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">{total} users total</p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-17.5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="p-4">
                  <TableSkeleton rows={5} columns={6} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "No users match your search."
                      : "No users found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: IUser) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" title={user.email}>
                          {maskEmail(user.email)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground" title={user.phone}>
                      {user.phone ? maskPhone(user.phone) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[user.role]}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.isActive} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownActions
                      user={user}
                      onView={() => handleViewUser(user._id)}
                      onEdit={() => handleEditRoleOpen(user)}
                      onToggle={() => setToggleTarget(user)}
                      onDelete={() => setDeleteTarget(user)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Server Pagination ──────────────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── View User Dialog ───────────────────────────────────────── */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Viewing user profile information
            </DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg bg-muted">
                    {getInitials(viewUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{viewUser.name}</p>
                  <p className="text-sm text-muted-foreground" title={viewUser.email}>
                    {maskEmail(viewUser.email)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium" title={viewUser.phone || ""}>
                    {viewUser.phone ? maskPhone(viewUser.phone) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{viewUser.age || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge
                    variant="outline"
                    className={roleColors[viewUser.role]}
                  >
                    {viewUser.role.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={viewUser.isActive} />
                </div>
                <div>
                  <p className="text-muted-foreground">Verified</p>
                  <p className="font-medium">
                    {viewUser.isVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {formatDate(viewUser.createdAt)}
                  </p>
                </div>
              </div>
              {viewUser.address && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{viewUser.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Dialog ───────────────────────────────────────── */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for {editUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User</Label>
              <p className="text-sm">
                {editUser?.name} ({editUser?.email})
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as UserRole)}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUser(null)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRoleSave} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Toggle Active Confirm ──────────────────────────────────── */}
      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={() => setToggleTarget(null)}
        title={
          toggleTarget?.isActive === "ACTIVE" ? "Block User" : "Activate User"
        }
        description={
          toggleTarget?.isActive === "ACTIVE"
            ? `Are you sure you want to block "${toggleTarget?.name}"? They will lose access to the platform.`
            : `Are you sure you want to activate "${toggleTarget?.name}"? They will regain access to the platform.`
        }
        onConfirm={handleToggleActive}
        isLoading={toggleStatusMutation.isPending}
        variant={
          toggleTarget?.isActive === "ACTIVE" ? "destructive" : "default"
        }
        confirmLabel={
          toggleTarget?.isActive === "ACTIVE" ? "Block User" : "Activate User"
        }
      />

      {/* ── Delete Confirm ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
        confirmLabel="Delete User"
      />
    </div>
  );
}

// ─── Dropdown Actions ─────────────────────────────────────────────────

function DropdownActions({
  user,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  user: IUser;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenuWithActions
      trigger={
        <Button variant="ghost" size="icon-xs">
          <MoreHorizontal className="size-4" />
        </Button>
      }
      items={[
        { label: "View Details", icon: Eye, onClick: onView },
        { label: "Edit Role", icon: Pencil, onClick: onEdit },
        {
          label: user.isActive === "ACTIVE" ? "Block User" : "Activate User",
          icon: user.isActive === "ACTIVE" ? ShieldOff : ShieldCheck,
          onClick: onToggle,
        },
        { label: "Delete", icon: Trash2, onClick: onDelete, destructive: true },
      ]}
    />
  );
}

// ─── Reusable Dropdown Menu ───────────────────────────────────────────

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";

function DropdownMenuWithActions({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    destructive?: boolean;
  }>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            {idx > 0 && item.destructive && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              className={
                item.destructive ? "text-red-600 focus:text-red-600" : ""
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
