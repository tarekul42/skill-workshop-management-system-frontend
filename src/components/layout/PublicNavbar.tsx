"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  LogOut,
  GraduationCap,
  Bell,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSavedUser, clearSavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie } from "@/app/actions/auth";
import { clearAccessToken, apiClient } from "@/lib/api-client";
import { getInitials } from "@/lib/formatters";
import { DASHBOARD_ROUTES } from "@/lib/constants";

import type { SavedUser } from "@/lib/auth-helpers";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Workshops", href: "/workshops" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SavedUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const syncUser = useCallback(() => {
    setUser(getSavedUser());
  }, []);

  useEffect(() => {
    // Pure fix: Defer state update to avoid cascading render lint error
    const timer = setTimeout(() => syncUser(), 0);

    const handleStorageChange = () => syncUser();
    const handleAuthChange = () => syncUser();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleAuthChange);

    const handleScroll = () => {
      // §2.3 — scroll >50px triggers compact nav
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [syncUser]);

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST", skipCsrf: true });
    } catch {
      // Continue cleanup
    }
    clearSavedUser();
    clearAccessToken();
    await clearSecureAuthCookie();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const dashboardRoute = user
    ? DASHBOARD_ROUTES[user.role as keyof typeof DASHBOARD_ROUTES]
    : "/login";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "h-16 border-b border-border bg-background/92 shadow-overlay backdrop-blur-xl"
          : "h-18 bg-transparent",
      )}
    >
      <div className="site-container flex h-full items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-primary/20 blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <GraduationCap className="relative size-7 text-primary transition-transform group-hover:scale-110 group-hover:-rotate-3" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            <span className="text-foreground">Skill</span>
            <span className="text-primary">Workshop</span>
          </span>
        </Link>

        {/* Desktop Navigation — §1.3 hover underline grows from center */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-underline relative text-sm font-medium transition-colors duration-150 hover:text-foreground",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-foreground-subtle",
              )}
            >
              {link.label}
              {/* Framer Motion shared underline for the active page */}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active-underline"
                  className="absolute -bottom-1.25 left-0 h-0.5 w-full rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
              >
                <Bell className="h-4 w-4 text-foreground-subtle" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 p-1 pr-3 hover:bg-surface-2 rounded-full"
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      {user.picture && (
                        <AvatarImage src={user.picture} alt={user.name} />
                      )}
                      <AvatarFallback className="text-xs font-bold bg-primary-subtle text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">
                      {user.name.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl"
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-xs text-foreground-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg p-2.5 cursor-pointer"
                  >
                    <Link href={dashboardRoute}>
                      <LayoutDashboard className="mr-2 size-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg p-2.5 text-danger focus:bg-danger-subtle focus:text-danger cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="font-semibold"
              >
                <Link href="/login">Login</Link>
              </Button>
              {/* §1.5 — subtle pulsing glow to draw attention without being annoying */}
              <Button
                size="sm"
                asChild
                className="font-bold animate-glow-pulse"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-surface-2"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85%] sm:w-95 p-0 border-l border-border bg-background"
            >
              <SheetHeader className="p-6 border-b border-border">
                <SheetTitle className="text-left">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <GraduationCap className="size-6 text-primary" />
                    <span className="font-display text-lg font-extrabold">
                      Skill<span className="text-primary">Workshop</span>
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-[calc(100vh-80px)]">
                <nav className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all",
                        isActive(link.href)
                          ? "bg-primary-subtle text-primary"
                          : "text-foreground-subtle hover:bg-surface-2 hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto p-6 border-t border-border bg-surface-1/50">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-10 w-10">
                          {user.picture && (
                            <AvatarImage src={user.picture} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-primary-subtle text-primary font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-foreground truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-foreground-muted truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="h-11">
                          <Link
                            href={dashboardRoute}
                            onClick={() => setOpen(false)}
                          >
                            Dashboard
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          className="h-11"
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        asChild
                        className="h-12 text-base font-bold"
                      >
                        <Link href="/login" onClick={() => setOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="h-12 text-base font-bold">
                        <Link href="/register" onClick={() => setOpen(false)}>
                          Join Now
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
