"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ExternalLink, LogOut } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu } from "lucide-react";

import type { NavSection } from "@/types/dashboard.types";

// ─── Icon Mapping ───────────────────────────────────────────────────

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

// ─── Sidebar Configs ────────────────────────────────────────────────

const sidebarConfig: Record<string, NavSection[]> = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/super-admin/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Admins", href: "/super-admin/admins", icon: "Shield" },
        { label: "Users", href: "/super-admin/users", icon: "Users" },
        { label: "Workshops", href: "/super-admin/workshops", icon: "BookOpen" },
        { label: "Enrollments", href: "/super-admin/enrollments", icon: "ClipboardList" },
        { label: "Payments", href: "/super-admin/payments", icon: "CreditCard" },
        { label: "Categories", href: "/super-admin/categories", icon: "Tag" },
        { label: "Levels", href: "/super-admin/levels", icon: "Layers" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Audit Logs", href: "/super-admin/audit-logs", icon: "FileText" },
        { label: "Settings", href: "/super-admin/settings", icon: "Settings" },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Users", href: "/admin/users", icon: "Users" },
        { label: "Workshops", href: "/admin/workshops", icon: "BookOpen" },
        { label: "Enrollments", href: "/admin/enrollments", icon: "ClipboardList" },
        { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
        { label: "Categories", href: "/admin/categories", icon: "Tag" },
        { label: "Levels", href: "/admin/levels", icon: "Layers" },
      ],
    },
    {
      title: "Reports",
      items: [
        { label: "Audit Logs", href: "/admin/audit-logs", icon: "FileText" },
      ],
    },
  ],
  INSTRUCTOR: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/instructor/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      title: "Workshops",
      items: [
        { label: "My Workshops", href: "/instructor/workshops", icon: "BookOpen" },
        { label: "Create Workshop", href: "/instructor/workshops/create", icon: "PlusCircle" },
      ],
    },
    {
      title: "Students",
      items: [
        { label: "My Students", href: "/instructor/students", icon: "GraduationCap" },
        { label: "Enrollments", href: "/instructor/enrollments", icon: "ClipboardList" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Profile", href: "/instructor/profile", icon: "User" },
      ],
    },
  ],
  STUDENT: [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      title: "Learning",
      items: [
        { label: "Browse Workshops", href: "/workshops", icon: "Search" },
        { label: "My Enrollments", href: "/student/enrollments", icon: "BookMarked" },
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

// ─── Props ──────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  role: "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

// ─── Nav Content (shared between desktop & mobile) ──────────────────

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
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
      <ul className="flex flex-col gap-6">
        {sections.map((section) => (
          <li key={section.title} className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const IconComponent = iconMap[item.icon];
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {IconComponent && (
                            <IconComponent className="size-4 shrink-0" />
                          )}
                          <span>{item.label}</span>
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

// ─── Sidebar Component ──────────────────────────────────────────────

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const sections = sidebarConfig[role] ?? [];

  return (
    <>
      {/* ── Desktop Sidebar (lg and above) ────────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background z-30">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4">
          <GraduationCap className="size-6 text-primary" />
          <Link href="/" className="text-lg font-bold tracking-tight">
            Skill Workshop
          </Link>
        </div>

        <Separator />

        {/* Navigation */}
        <SidebarNavContent sections={sections} pathname={pathname} />

        <Separator />

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1 p-3">
          <Button variant="ghost" size="sm" asChild className="justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ExternalLink className="size-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="justify-start gap-3 text-muted-foreground hover:text-destructive">
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ── Mobile Sidebar (Sheet) ────────────────────────────────── */}
      <div className="lg:hidden">
        <MobileSheetSidebar sections={sections} pathname={pathname} />
      </div>
    </>
  );
}

// ─── Mobile Sheet Sidebar ───────────────────────────────────────────

function MobileSheetSidebar({
  sections,
  pathname,
}: {
  sections: NavSection[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-40 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <SheetHeader className="flex flex-row items-center gap-2 px-4 py-3 border-b">
          <GraduationCap className="size-5 text-primary" />
          <Link href="/" onClick={() => setOpen(false)}>
            <SheetTitle className="text-base font-bold tracking-tight">
              Skill Workshop
            </SheetTitle>
          </Link>
        </SheetHeader>

        <SidebarNavContent
          sections={sections}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />

        <Separator />

        <div className="flex flex-col gap-1 p-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            <Link href="/">
              <ExternalLink className="size-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
