"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Ban,
  CheckCircle2,
  Loader2,
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

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { maskEmail, maskPhone } from "@/lib/utils/masking";
import { getAllUsers, updateUser, deleteUser } from "@/lib/api/services";
import { formatDate } from "@/lib/formatters";
import type { IUser, UserRole, IsActive } from "@/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function roleBadge(role: UserRole) {
  const map: Record<
    UserRole,
    { variant: "default" | "secondary" | "success" | "warning" | "danger"; label: string }
  > = {
    SUPER_ADMIN: { variant: "danger", label: "Super Admin" },
    ADMIN: { variant: "warning", label: "Admin" },
    INSTRUCTOR: { variant: "secondary", label: "Instructor" },
    STUDENT: { variant: "default", label: "Student" },
  };
  const { variant, label } = map[role] ?? { variant: "default" as const, label: role };
  return <Badge variant={variant}>{label}</Badge>;
}

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<IUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("ADMIN");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["admins", page, debouncedSearch],
    queryFn: () => getAllUsers({ page, limit: 10, searchTerm: debouncedSearch || undefined }),
  });

  const admins = (data?.data ?? []).filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN");
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPage: 1 };

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: updateData,
    }: {
      id: string;
      data: { role?: UserRole; isActive?: IsActive };
    }) => updateUser(id, updateData),
    onSuccess: () => {
      toast.success("Admin updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setRoleOpen(false);
    },
    onError: () => toast.error("Failed to update admin"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("Admin deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete admin"),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Admins" description="Manage administrator accounts" />

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-muted-foreground text-sm">
          {meta.total} admin{meta.total !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Shield className="text-muted-foreground mb-3 size-10" />
          <p className="text-muted-foreground text-sm font-medium">No admins found</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {debouncedSearch ? "Try a different search term" : "No admin accounts exist yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {maskEmail(admin.email)}
                  </TableCell>
                  <TableCell>{roleBadge(admin.role)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        admin.isActive === "ACTIVE"
                          ? "Active"
                          : admin.isActive === "BLOCKED"
                            ? "Blocked"
                            : "Inactive"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(admin.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setViewOpen(true);
                        }}
                      >
                        <UserCog className="size-4" />
                        <span className="ml-1.5 hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setNewRole(admin.role);
                          setRoleOpen(true);
                        }}
                      >
                        <Shield className="size-4" />
                        <span className="ml-1.5 hidden sm:inline">Role</span>
                      </Button>
                      {admin.isActive === "ACTIVE" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({ id: admin._id, data: { isActive: "BLOCKED" } })
                          }
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Ban className="size-4" />
                          )}
                          <span className="ml-1.5 hidden sm:inline">
                            {updateMutation.isPending ? "Blocking..." : "Block"}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({ id: admin._id, data: { isActive: "ACTIVE" } })
                          }
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          <span className="ml-1.5 hidden sm:inline">
                            {updateMutation.isPending ? "Activating..." : "Activate"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta.totalPage > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-muted-foreground text-sm">
                Page {meta.page} of {meta.totalPage}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback>{getInitials(selectedAdmin.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedAdmin.name}</p>
                  <p className="text-muted-foreground text-sm">{maskEmail(selectedAdmin.email)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Role</span>
                  <p className="font-medium">{roleBadge(selectedAdmin.role)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium">
                    <StatusBadge
                      status={selectedAdmin.isActive === "ACTIVE" ? "Active" : "Inactive"}
                    />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Verified</span>
                  <p className="font-medium">{selectedAdmin.isVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Joined</span>
                  <p className="font-medium">{formatDate(selectedAdmin.createdAt)}</p>
                </div>
                {selectedAdmin.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone</span>
                    <p className="font-medium">{maskPhone(selectedAdmin.phone)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Role</DialogTitle>
            <DialogDescription>Update the role for {selectedAdmin?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
              <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedAdmin &&
                updateMutation.mutate({ id: selectedAdmin._id, data: { role: newRole } })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Admin"
        description="Are you sure you want to delete this admin? This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
