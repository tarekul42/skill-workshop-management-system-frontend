import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Configuration ──────────────────────────────────────────────────────

/** Cookie that stores the user's role after login (e.g. "SUPER_ADMIN") */
const ROLE_COOKIE = "swms_role";

/** Map of URL path prefixes to their expected role values */
const ROLE_ROUTES: Record<string, string> = {
  "super-admin": "SUPER_ADMIN",
  admin: "ADMIN",
  instructor: "INSTRUCTOR",
  student: "STUDENT",
};

/** Auth page prefixes — users who already have a role cookie are redirected away */
const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Reads the `swms_role` cookie from the request.
 * Returns the raw cookie value (uppercase role string) or `null`.
 */
function getRoleCookie(request: NextRequest): string | null {
  return request.cookies.get(ROLE_COOKIE)?.value ?? null;
}

/**
 * Determines whether a path belongs to a protected dashboard route and
 * returns the expected role for that path, or `null` if the path is not
 * a protected dashboard route.
 */
function getExpectedRole(pathname: string): string | null {
  const segment = pathname.split("/")[1]; // first segment after "/"
  if (!segment) return null;
  return ROLE_ROUTES[segment] ?? null;
}

/**
 * Checks if a path starts with any of the auth page prefixes.
 */
function isAuthPage(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

// ─── Middleware ─────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = getRoleCookie(request);

  // ── Protected dashboard routes ──────────────────────────────────────
  const expectedRole = getExpectedRole(pathname);

  if (expectedRole) {
    // No cookie at all → redirect to login
    if (!roleCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie present but role doesn't match the URL segment → redirect to login
    if (roleCookie !== expectedRole) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Role matches — allow request through
    return NextResponse.next();
  }

  // ── Auth pages ─────────────────────────────────────────────────────
  if (isAuthPage(pathname)) {
    // If the user already has a valid role cookie, redirect them to their
    // dashboard so they don't linger on login/register pages.
    if (roleCookie && ROLE_ROUTES[roleCookie.toLowerCase()]) {
      const dashboardPath = `/${roleCookie.toLowerCase()}/dashboard`;
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = dashboardPath;
      return NextResponse.redirect(dashboardUrl);
    }

    // Not authenticated — allow access to auth pages
    return NextResponse.next();
  }

  // ── All other routes (public marketing pages, API routes, etc.) ────
  return NextResponse.next();
}

// ─── Matcher ────────────────────────────────────────────────────────────
// Run middleware on every request except Next.js internals and static assets.
export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - /_next/*   (Next.js internals)
     *   - /api/*     (API routes — handled separately)
     *   - /favicon.* (favicons)
     *   - /_vercel/* (Vercel internals)
     *   - Static file extensions (images, fonts, etc.)
     */
    "/((?!_next|api|favicon\\.|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)",
  ],
};
