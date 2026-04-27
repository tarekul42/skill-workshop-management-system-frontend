"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getSavedUser, getUserRole, clearSavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie } from "@/app/actions/auth";
import { clearAccessToken, apiClient } from "@/lib/api-client";
import { getInitials } from "@/lib/formatters";

import type { SavedUser } from "@/lib/auth-helpers";

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
  const [mounted, setMounted] = React.useState(false);
  const user = React.useMemo(() => (mounted ? getSavedUser() : null), [mounted]);
  const role = React.useMemo(() => (mounted ? getUserRole() : null), [mounted]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:pl-72">
      {/* ── Mobile menu button ─────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Toggle sidebar menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* ── Spacer ─────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right side actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
            >
              <Bell className="size-4" />
              {/* Notification dot placeholder */}
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-muted"
            >
              <Avatar size="sm">
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium leading-none">
                  {displayName}
                </span>
                {roleLabel && (
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[10px] px-1.5 py-0"
                  >
                    {roleLabel}
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/${role?.toLowerCase()}/profile`}
                className="cursor-pointer"
              >
                <User className="size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={
                  role === "SUPER_ADMIN"
                    ? "/super-admin/settings"
                    : role === "ADMIN"
                      ? "/admin/settings"
                      : `/${role?.toLowerCase()}/profile`
                }
                className="cursor-pointer"
              >
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
