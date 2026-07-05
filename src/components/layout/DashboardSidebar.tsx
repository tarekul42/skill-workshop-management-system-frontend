"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, ExternalLink, LogOut, Menu } from "lucide-react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  Tag,
  Layers,
  FileText,
  Settings,
  PlusCircle,
  Search,
  BookMarked,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { clearSavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie } from "@/app/actions/auth";
import { clearAccessToken, apiClient } from "@/lib/api-client";

import type { NavSection } from "@/types/dashboard.types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Shield,
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  Tag,
  Layers,
  FileText,
  Settings,
  PlusCircle,
  GraduationCap,
  Search,
  BookMarked,
  User,
  ExternalLink,
  LogOut,
};

const sidebarConfig: Record<string, NavSection[]> = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/super-admin/dashboard",
          icon: "LayoutDashboard",
        },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Admins", href: "/super-admin/admins", icon: "Shield" },
        { label: "Users", href: "/super-admin/users", icon: "Users" },
        {
          label: "Workshops",
          href: "/super-admin/workshops",
          icon: "BookOpen",
        },
        {
          label: "Enrollments",
          href: "/super-admin/enrollments",
          icon: "ClipboardList",
        },
        {
          label: "Payments",
          href: "/super-admin/payments",
          icon: "CreditCard",
        },
        { label: "Categories", href: "/super-admin/categories", icon: "Tag" },
        { label: "Levels", href: "/super-admin/levels", icon: "Layers" },
      ],
    },
    {
      title: "System",
      items: [
        {
          label: "Audit Logs",
          href: "/super-admin/audit-logs",
          icon: "FileText",
        },
        { label: "Settings", href: "/super-admin/settings", icon: "Settings" },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: "LayoutDashboard",
        },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Users", href: "/admin/users", icon: "Users" },
        { label: "Workshops", href: "/admin/workshops", icon: "BookOpen" },
        {
          label: "Enrollments",
          href: "/admin/enrollments",
          icon: "ClipboardList",
        },
        { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
        { label: "Categories", href: "/admin/categories", icon: "Tag" },
        { label: "Levels", href: "/admin/levels", icon: "Layers" },
      ],
    },
    {
      title: "Reports",
      items: [{ label: "Audit Logs", href: "/admin/audit-logs", icon: "FileText" }],
    },
  ],
  INSTRUCTOR: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/instructor/dashboard",
          icon: "LayoutDashboard",
        },
      ],
    },
    {
      title: "Workshops",
      items: [
        {
          label: "My Workshops",
          href: "/instructor/workshops",
          icon: "BookOpen",
        },
        {
          label: "Create Workshop",
          href: "/instructor/workshops/create",
          icon: "PlusCircle",
        },
      ],
    },
    {
      title: "Students",
      items: [
        {
          label: "My Students",
          href: "/instructor/students",
          icon: "GraduationCap",
        },
        {
          label: "Enrollments",
          href: "/instructor/enrollments",
          icon: "ClipboardList",
        },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Profile", href: "/instructor/profile", icon: "User" }],
    },
  ],
  STUDENT: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/student/dashboard",
          icon: "LayoutDashboard",
        },
      ],
    },
    {
      title: "Learning",
      items: [
        { label: "Browse Workshops", href: "/workshops", icon: "Search" },
        {
          label: "My Enrollments",
          href: "/student/enrollments",
          icon: "BookMarked",
        },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Payments", href: "/student/payments", icon: "CreditCard" },
        { label: "Profile", href: "/student/profile", icon: "User" },
      ],
    },
  ],
};

function SidebarNavContent({
  sections,
  pathname,
  onNavigate,
}: {
  sections: NavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6">
      <ul className="flex flex-col gap-8">
        {sections.map((section) => (
          <li key={section.title} className="flex flex-col gap-2">
            <p className="text-sidebar-text-muted px-3 text-[10px] font-bold tracking-[0.2em] uppercase">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const IconComponent = iconMap[item.icon];
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group/nav-item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300",
                            isActive
                              ? "bg-primary shadow-3 translate-x-1 text-white"
                              : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text hover:translate-x-1"
                          )}
                        >
                          {IconComponent && (
                            <IconComponent
                              className={cn(
                                "size-5 shrink-0 transition-transform group-hover/nav-item:scale-110",
                                isActive
                                  ? "text-white"
                                  : "text-sidebar-text-muted group-hover/nav-item:text-accent"
                              )}
                            />
                          )}
                          <span>{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="active-indicator"
                              className="bg-accent absolute top-1/4 -left-1 h-1/2 w-1 rounded-full"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="lg:hidden">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const sections = sidebarConfig[role] ?? [];

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST", skipCsrf: true });
    } catch {}
    clearSavedUser();
    clearAccessToken();
    await clearSecureAuthCookie();
    router.push("/login");
  };

  return (
    <>
      <aside className="border-sidebar-border bg-sidebar-bg text-sidebar-text shadow-raised z-40 hidden border-r lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="border-sidebar-border/50 flex h-16 items-center gap-3 border-b px-6">
          <div className="bg-primary flex size-9 items-center justify-center rounded-xl shadow-lg">
            <GraduationCap className="size-5.5 text-white" />
          </div>
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
          >
            Skill<span className="text-accent">Workshop</span>
          </Link>
        </div>

        <SidebarNavContent sections={sections} pathname={pathname} />

        <div className="border-sidebar-border/50 mt-auto flex flex-col gap-2 border-t p-5">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-sidebar-text-muted hover:bg-sidebar-hover group hover:text-sidebar-text justify-start gap-3 rounded-xl transition-all"
          >
            <Link href="/">
              <ExternalLink className="size-4 transition-transform group-hover:scale-110" />
              <span className="font-semibold">Back to Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-sidebar-text-muted hover:bg-danger-subtle hover:text-danger group justify-start gap-3 rounded-xl transition-all"
          >
            <LogOut className="size-4 transition-transform group-hover:scale-110" />
            <span className="font-bold">Logout</span>
          </Button>
        </div>
      </aside>

      <div className="lg:hidden">
        <MobileSheetSidebar sections={sections} pathname={pathname} onLogout={handleLogout} />
      </div>
    </>
  );
}

function MobileSheetSidebar({
  sections,
  pathname,
  onLogout,
}: {
  sections: NavSection[];
  pathname: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar menu"
          className="bg-background/80 border-border fixed top-3 left-3 z-40 h-10 w-10 rounded-lg border shadow-sm backdrop-blur lg:hidden"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="border-sidebar-border bg-sidebar-bg text-sidebar-text w-70 border-r p-0"
        showCloseButton={false}
      >
        <SheetHeader className="border-sidebar-border flex h-20 flex-row items-center gap-3 border-b px-6">
          <GraduationCap className="text-primary size-7" />
          <Link href="/" onClick={() => setOpen(false)}>
            <SheetTitle className="font-display text-sidebar-text text-lg font-extrabold tracking-tight">
              Skill<span className="text-primary">Workshop</span>
            </SheetTitle>
          </Link>
        </SheetHeader>

        <SidebarNavContent
          sections={sections}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />

        <div className="border-sidebar-border mt-auto flex flex-col gap-2 border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text h-11 justify-start rounded-xl"
            onClick={() => setOpen(false)}
          >
            <Link href="/">
              <ExternalLink className="mr-3 size-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-sidebar-text-muted hover:bg-danger-subtle hover:text-danger h-11 justify-start rounded-xl"
          >
            <LogOut className="mr-3 size-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
