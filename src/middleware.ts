import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

async function getRoleCookie(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(ROLE_COOKIE)?.value;
  if (!token) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_for_development_only");
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string;
  } catch {
    return null;
  }
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = await getRoleCookie(request);

  // Initialize response
  let response = NextResponse.next();

  // ── Protected dashboard routes ──────────────────────────────────────
  const expectedRole = getExpectedRole(pathname);

  if (expectedRole) {
    if (!roleCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);
    } else if (roleCookie !== expectedRole) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      response = NextResponse.redirect(loginUrl);
    }
  } else if (isAuthPage(pathname)) {
    if (roleCookie && ROLE_ROUTES[roleCookie.toLowerCase()]) {
      const dashboardPath = `/${roleCookie.toLowerCase()}/dashboard`;
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = dashboardPath;
      response = NextResponse.redirect(dashboardUrl);
    }
  }

  // ── Security Headers ────────────────────────────────────────────────
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"} https://lh3.googleusercontent.com;
    frame-src 'self' https://sandbox.sslcommerz.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return response;
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
