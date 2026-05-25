"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getSavedUser, getUserRole, clearSavedUser } from "@/lib/auth-helpers";
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
  const [mounted, setMounted] = React.useState(false);
  const user = React.useMemo(
    () => (mounted ? getSavedUser() : null),
    [mounted],
  );
  const role = React.useMemo(() => (mounted ? getUserRole() : null), [mounted]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      {/* ── Mobile menu button ─────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden rounded-xl hover:bg-surface-2"
        onClick={onMenuClick}
        aria-label="Toggle sidebar menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* ── Search/Quick Action Placeholder ────────────────────────── */}
      <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-foreground-disabled hover:text-foreground-muted transition-colors cursor-pointer">
        <span className="bg-surface-3 px-2 py-0.5 rounded-md text-[10px] border border-border">
          ⌘ K
        </span>
        <span>Search or jump to...</span>
      </div>

      <div className="flex-1" />

      {/* ── Right side actions ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative rounded-xl hover:bg-surface-2"
            >
              <Bell className="size-4.5" />
              {/* Notification dot */}
              <span className="absolute top-2 right-2 size-2 rounded-full bg-accent ring-2 ring-background" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-lg shadow-3 border-border">
            Notifications
          </TooltipContent>
        </Tooltip>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-surface-2 rounded-full transition-all"
            >
              <Avatar className="size-8.5 ring-2 ring-primary/5 transition-all">
                <AvatarFallback className="text-xs font-bold bg-primary-subtle text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex text-left">
                <span className="text-sm font-bold leading-tight">
                  {displayName.split(" ")[0]}
                </span>
                {roleLabel && (
                  <span className="text-[10px] font-bold text-foreground-disabled uppercase tracking-wider leading-none mt-0.5">
                    {roleLabel}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-xl shadow-4 border-border/50"
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold leading-tight">{displayName}</p>
                <p className="text-[11px] text-foreground-muted truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              asChild
              className="rounded-lg p-2.5 cursor-pointer"
            >
              <Link
                href={`/${role?.toLowerCase()}/profile`}
                className="flex items-center gap-3"
              >
                <div className="size-8 flex items-center justify-center rounded-lg bg-surface-2 text-primary">
                  <User className="size-4" />
                </div>
                <span className="font-semibold">My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="rounded-lg p-2.5 cursor-pointer"
            >
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
                <div className="size-8 flex items-center justify-center rounded-lg bg-surface-2 text-primary">
                  <Settings className="size-4" />
                </div>
                <span className="font-semibold">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-lg p-2.5 text-danger focus:bg-danger-subtle focus:text-danger cursor-pointer group"
            >
              <div className="size-8 flex items-center justify-center rounded-lg bg-danger-subtle/50 text-danger transition-colors group-focus:bg-danger group-focus:text-white">
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
