"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutDashboard, LogOut, GraduationCap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSavedUser, saveUser, clearSavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie, checkAuthSession } from "@/app/actions/auth";
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
    const timer = setTimeout(() => syncUser(), 0);

    const restoreSession = async () => {
      if (!getSavedUser()) {
        const isValid = await checkAuthSession();
        if (isValid) {
          try {
            const { getMe } = await import("@/lib/api/services");
            const me = await getMe();
            saveUser(me);
            syncUser();
          } catch {
            // Session restore failed — user is not authenticated
          }
        }
      }
    };
    restoreSession();

    const verifySession = async () => {
      if (getSavedUser()) {
        const isValid = await checkAuthSession();
        if (!isValid) {
          clearSavedUser();
          clearAccessToken();
          syncUser();
        }
      }
    };
    verifySession();

    const handleAuthChange = () => syncUser();
    window.addEventListener("auth-change", handleAuthChange);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
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
          ? "border-border bg-background/92 shadow-overlay h-16 border-b backdrop-blur-xl"
          : "bg-background/60 h-18 border-b border-transparent"
      )}
    >
      <div className="site-container flex h-full items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <div className="relative">
            <div className="bg-primary/20 absolute -inset-1 rounded-lg opacity-0 blur transition duration-500 group-hover:opacity-100" />
            <GraduationCap className="text-primary relative size-7 transition-transform group-hover:scale-110 group-hover:-rotate-3" />
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
                "nav-underline hover:text-foreground relative text-sm font-medium transition-colors duration-150",
                isActive(link.href) ? "text-foreground" : "text-foreground-subtle"
              )}
            >
              {link.label}
              {/* Framer Motion shared underline for the active page */}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active-underline"
                  className="bg-primary absolute -bottom-1.25 left-0 h-0.5 w-full rounded-full"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-surface-2 flex items-center gap-2.5 rounded-full p-1 pr-3"
                  >
                    <Avatar className="border-border h-8 w-8 border">
                      {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                      <AvatarFallback className="bg-primary-subtle text-primary text-xs font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuLabel className="p-3 font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-foreground-muted truncate text-xs">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2.5">
                    <Link href={dashboardRoute}>
                      <LayoutDashboard className="text-primary mr-2 size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-danger focus:bg-danger-subtle focus:text-danger cursor-pointer rounded-lg p-2.5"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="font-semibold">
                <Link href="/login">Login</Link>
              </Button>
              {/* §1.5 — subtle pulsing glow to draw attention without being annoying */}
              <Button size="sm" asChild className="font-bold">
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
                className="hover:bg-surface-2 h-10 w-10 rounded-lg"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-border bg-background w-[85%] border-l p-0 sm:w-95"
            >
              <SheetHeader className="border-border border-b p-6">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <GraduationCap className="text-primary size-6" />
                    <span className="font-display text-lg font-extrabold">
                      Skill<span className="text-primary">Workshop</span>
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex h-[calc(100vh-80px)] flex-col">
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
                          : "text-foreground-subtle hover:bg-surface-2 hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-border bg-surface-1/50 mt-auto border-t p-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-10 w-10">
                          {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                          <AvatarFallback className="bg-primary-subtle text-primary font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="text-foreground truncate text-sm font-bold">
                            {user.name}
                          </span>
                          <span className="text-foreground-muted truncate text-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="h-11">
                          <Link href={dashboardRoute} onClick={() => setOpen(false)}>
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
                      <Button variant="outline" asChild className="h-12 text-base font-bold">
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
