"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, User, Settings, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getSavedUser, saveUser, clearSavedUser } from "@/lib/auth-helpers";
import type { SavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie } from "@/app/actions/auth";
import { clearAccessToken, apiClient } from "@/lib/api-client";
import { getInitials } from "@/lib/formatters";

// ─── Props ──────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

// ─── Role Label Map ─────────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
};

// ─── Component ──────────────────────────────────────────────────────

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<SavedUser | null>(() => getSavedUser());
  const role = user?.role ?? null;

  React.useEffect(() => {
    if (user) return;

    const restore = async () => {
      try {
        const { getMe } = await import("@/lib/api/services");
        const me = await getMe();
        saveUser(me);
        setUser(me);
      } catch {
        // Restore failed — api-client will redirect to login on 401
      }
    };
    restore();
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST", skipCsrf: true });
    } catch {
      // Continue with client-side cleanup even if backend call fails
    }
    clearSavedUser();
    clearAccessToken();
    await clearSecureAuthCookie();
    router.push("/login");
  };

  const initials = user?.name ? getInitials(user.name) : "?";
  const displayName = user?.name ?? "User";
  const roleLabel = role ? (roleLabels[role] ?? role) : "";

  return (
    <header className="border-border/60 bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-5 backdrop-blur-xl">
      {/* ── Mobile menu button ─────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-surface-2 rounded-xl lg:hidden"
        onClick={onMenuClick}
        aria-label="Toggle sidebar menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* ── Search/Quick Action Placeholder ────────────────────────── */}
      <div className="text-foreground-disabled hover:text-foreground-muted hidden cursor-pointer items-center gap-2 text-sm font-medium transition-colors lg:flex">
        <span className="bg-surface-3 border-border rounded-md border px-2 py-0.5 text-[10px]">
          ⌘ K
        </span>
        <span>Search or jump to...</span>
      </div>

      <div className="flex-1" />

      {/* ── Right side actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-surface-2 flex items-center gap-2.5 rounded-full p-1.5 pr-3 transition-all"
            >
              <Avatar className="ring-primary/5 size-8.5 ring-2 transition-all">
                <AvatarFallback className="bg-primary-subtle text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left sm:flex">
                <span className="text-sm leading-tight font-bold">{displayName.split(" ")[0]}</span>
                {roleLabel && (
                  <span className="text-foreground-disabled mt-0.5 text-[10px] leading-none font-bold tracking-wider uppercase">
                    {roleLabel}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="shadow-4 border-border/50 w-56 rounded-xl p-2"
          >
            <DropdownMenuLabel className="p-3 font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm leading-tight font-bold">{displayName}</p>
                <p className="text-foreground-muted truncate text-[11px]">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2.5">
              <Link href={`/${role?.toLowerCase()}/profile`} className="flex items-center gap-3">
                <div className="bg-surface-2 text-primary flex size-8 items-center justify-center rounded-lg">
                  <User className="size-4" />
                </div>
                <span className="font-semibold">My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2.5">
              <Link
                href={
                  role === "SUPER_ADMIN"
                    ? "/super-admin/settings"
                    : role === "ADMIN"
                      ? "/admin/settings"
                      : `/${role?.toLowerCase()}/profile`
                }
                className="flex items-center gap-3"
              >
                <div className="bg-surface-2 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Settings className="size-4" />
                </div>
                <span className="font-semibold">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-danger focus:bg-danger-subtle focus:text-danger group cursor-pointer rounded-lg p-2.5"
            >
              <div className="bg-danger-subtle/50 text-danger group-focus:bg-danger flex size-8 items-center justify-center rounded-lg transition-colors group-focus:text-white">
                <LogOut className="size-4" />
              </div>
              <span className="font-bold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
