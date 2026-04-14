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
} from "lucide-react";
import { z } from "zod/v4";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarImage } from "@/components/ui/avatar";
import { PageHeader, StatusBadge, FormSkeleton } from "@/components/shared";

import { getMe, updateUser, changePassword } from "@/lib/api/services";
import { formatDate, getInitials } from "@/lib/formatters";
import { getSavedUser, saveUser } from "@/lib/auth-helpers";
import type { IUser } from "@/types";

// ─── Props ────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ role: string }>;
}

// ─── Validation schemas ───────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  age: z.coerce.number().min(1).optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Password Strength Bar ─────────────────────────────────────────

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

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-amber-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
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
              level <= strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ProfilePage({ params }: PageProps) {
  const savedUser = getSavedUser();

  const [, setRole] = useState<string>("");
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
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resolve role
  useEffect(() => {
    params.then((p) => setRole(p.role));
  }, [params]);

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
        name: result.data.name,
        phone: result.data.phone,
        age: result.data.age,
        address: result.data.address,
      });
      setUser(updated);

      // Update saved user in localStorage
      if (savedUser) {
        saveUser({
          ...savedUser,
          name: updated.name,
        });
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Password change ─────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(passwordData);

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
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Profile"
          description="Manage your account settings"
        />
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
          <p className="text-sm font-medium text-destructive">
            {error ?? "Failed to load profile"}
          </p>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account settings and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Profile Card (Left Column) ─────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 pb-8">
            <Avatar className="size-24">
              {user.picture && (
                <AvatarImage src={user.picture} alt={user.name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">{user.role}</Badge>
              <StatusBadge status={user.isActive} className="text-xs" />
              {user.isVerified && (
                <Badge
                  variant="outline"
                  className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                >
                  <Shield className="mr-1 size-3" />
                  Verified
                </Badge>
              )}
            </div>

            <Separator className="my-5 w-full" />

            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{user.address}</span>
                </div>
              )}
              {user.age && (
                <div className="flex items-center gap-3 text-sm">
                  <Award className="size-4 text-muted-foreground shrink-0" />
                  <span>Age: {user.age}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Edit Forms (Right Column) ──────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
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
                        Name <span className="text-destructive">*</span>
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
                        <p className="text-xs text-destructive">
                          {profileErrors.name}
                        </p>
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
                        placeholder="e.g. +880 1XXX-XXXXXX"
                      />
                      {profileErrors.phone && (
                        <p className="text-xs text-destructive">
                          {profileErrors.phone}
                        </p>
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
                        <p className="text-xs text-destructive">
                          {profileErrors.age}
                        </p>
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
                        <p className="text-xs text-destructive">
                          {profileErrors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
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
                      {isUpdating && <Loader2 className="animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="mt-0.5 text-sm">{user.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="mt-0.5 text-sm">{user.phone ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Age
                      </p>
                      <p className="mt-0.5 text-sm">{user.age ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Address
                      </p>
                      <p className="mt-0.5 text-sm">{user.address ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Current Password <span className="text-destructive">*</span>
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
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      aria-label={
                        showCurrentPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      New Password <span className="text-destructive">*</span>
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
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
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
                      <p className="text-xs text-destructive">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password{" "}
                      <span className="text-destructive">*</span>
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
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.newPassword ===
                        passwordData.confirmPassword && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3" />
                          <span>Passwords match</span>
                        </div>
                      )}
                    {passwordData.confirmPassword &&
                      passwordData.newPassword !==
                        passwordData.confirmPassword && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                          <X className="size-3" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    variant="outline"
                  >
                    {isChangingPassword && <Loader2 className="animate-spin" />}
                    Change Password
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
