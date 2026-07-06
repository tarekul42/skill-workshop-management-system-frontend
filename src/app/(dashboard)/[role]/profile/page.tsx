"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  Palette,
  Pencil,
  Save,
  Lock,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { FormSkeleton } from "@/components/ui/loading-skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { getMe, updateUser, changePassword, setPassword } from "@/lib/api/services";
import { formatDate, getInitials } from "@/lib/formatters";
import { getSavedUser, saveUser } from "@/lib/auth-helpers";
import { passwordSchema as passwordRule } from "@/lib/validation/password";
import type { IUser } from "@/types";

// ─── Validation schemas ───────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  phone: z.string().optional(),
  age: z.coerce.number().min(1).max(150).optional(),
  address: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const setPasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Password Strength ────────────────────────────────────────────

function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-danger" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-warning" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-info" };
  return { score: 4, label: "Strong", color: "bg-success" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = checkPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              level <= strength.score ? strength.color : "bg-surface-2"
            }`}
          />
        ))}
      </div>
      <p className="text-foreground-subtle text-xs">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const savedUser = getSavedUser();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    age: "" as string,
    address: "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user profile
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const me = await getMe();
        setUser(me);
        setProfileData({
          name: me.name ?? "",
          phone: me.phone ?? "",
          age: me.age ? String(me.age) : "",
          address: me.address ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // ── Profile update ──────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = profileSchema.safeParse({
      name: profileData.name,
      phone: profileData.phone || undefined,
      age: profileData.age ? Number(profileData.age) : undefined,
      address: profileData.address || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setProfileErrors(fieldErrors);
      return;
    }

    if (!user) return;

    setIsUpdating(true);
    setProfileErrors({});

    try {
      const updated = await updateUser(user._id, {
        name: result.data.name.trim(),
        phone: result.data.phone?.trim(),
        age: result.data.age,
        address: result.data.address?.trim(),
      });
      setUser(updated);

      if (savedUser) {
        saveUser({
          ...savedUser,
          name: updated.name,
        });
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Password change / set ───────────────────────────────────────
  const hasPassword = user?.auths?.some((a) => a.provider === "credentials") ?? false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = hasPassword ? changePasswordSchema : setPasswordSchema;
    const result = schema.safeParse(passwordData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      if (hasPassword) {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
      } else {
        await setPassword(passwordData.newPassword);
      }
      toast.success(hasPassword ? "Password changed successfully" : "Password set successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Manage your account settings" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <FormSkeleton fields={5} />
          </div>
          <div className="lg:col-span-2">
            <FormSkeleton fields={4} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-danger text-sm font-medium">{error ?? "Failed to load profile"}</p>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account settings and preferences" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Profile Card (Left) ─────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            {/* Cover gradient */}
            <div className="from-primary via-primary/70 to-primary/30 h-28 bg-linear-to-r" />

            <CardContent className="relative -mt-14 flex flex-col items-center px-6 pb-6">
              <Avatar className="border-background bg-background size-24 overflow-hidden border-4 shadow-md">
                {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-3 text-lg font-bold">{user.name}</h2>
              <p className="text-foreground-subtle text-sm">{user.email}</p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary">{user.role}</Badge>
                <StatusBadge status={user.isActive} className="text-xs" />
                {user.isVerified && (
                  <Badge
                    variant="outline"
                    className="border-success/30 bg-success-subtle text-success"
                  >
                    <Shield className="mr-1 size-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <Separator className="my-5" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-foreground-subtle size-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-foreground-subtle size-4 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="text-foreground-subtle size-4 shrink-0" />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}
                {user.age && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="text-foreground-subtle size-4 shrink-0" />
                    <span>Age: {user.age}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-foreground-subtle size-4 shrink-0" />
                  <span className="text-foreground-subtle">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Edit Forms (Right) ──────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-danger">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      {profileErrors.name && (
                        <p className="text-danger text-xs">{profileErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+8801XXXXXXXXX"
                      />
                      {profileErrors.phone && (
                        <p className="text-danger text-xs">{profileErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        value={profileData.age}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            age: e.target.value,
                          }))
                        }
                        placeholder="e.g. 30"
                      />
                      {profileErrors.age && (
                        <p className="text-danger text-xs">{profileErrors.age}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="e.g. Dhaka, Bangladesh"
                      />
                      {profileErrors.address && (
                        <p className="text-danger text-xs">{profileErrors.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: user.name ?? "",
                          phone: user.phone ?? "",
                          age: user.age ? String(user.age) : "",
                          address: user.address ?? "",
                        });
                        setProfileErrors({});
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-1.5 size-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-foreground-subtle text-xs font-medium">Name</p>
                    <p className="mt-0.5 text-sm">{user.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-foreground-subtle text-xs font-medium">Phone</p>
                    <p className="mt-0.5 text-sm">{user.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-foreground-subtle text-xs font-medium">Age</p>
                    <p className="mt-0.5 text-sm">{user.age ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-foreground-subtle text-xs font-medium">Address</p>
                    <p className="mt-0.5 text-sm">{user.address ?? "—"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                  <Palette className="text-primary size-4" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Choose your preferred theme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Change / Set Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                  <Lock className="text-primary size-4" />
                </div>
                <div>
                  <CardTitle>{hasPassword ? "Change Password" : "Set Password"}</CardTitle>
                  <CardDescription>
                    {hasPassword
                      ? "Update your password to keep your account secure"
                      : "Set a password for your account to enable password-based login"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {hasPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Current Password <span className="text-danger">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter your current password"
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground-subtle absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-danger text-xs">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      New Password <span className="text-danger">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Minimum 8 characters"
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground-subtle absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    <PasswordStrengthBar password={passwordData.newPassword} />
                    {passwordErrors.newPassword && (
                      <p className="text-danger text-xs">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-danger">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Re-enter new password"
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground-subtle absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.newPassword === passwordData.confirmPassword && (
                        <div className="text-success flex items-center gap-1.5 text-xs">
                          <Check className="size-3" />
                          <span>Passwords match</span>
                        </div>
                      )}
                    {passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword && (
                        <div className="text-danger flex items-center gap-1.5 text-xs">
                          <X className="size-3" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    {passwordErrors.confirmPassword && (
                      <p className="text-danger text-xs">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                    {hasPassword ? "Change Password" : "Set Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
