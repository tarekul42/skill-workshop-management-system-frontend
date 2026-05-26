import { jwtVerify } from "jose";
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
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

// ─── Helpers ────────────────────────────────────────────────────────────

async function getRoleCookie(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(ROLE_COOKIE)?.value;
  if (!token) return null;

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error(
        "[MIDDLEWARE] JWT_SECRET environment variable is not set. Denying all requests."
      );
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
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
  return AUTH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

// ─── Middleware ─────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = await getRoleCookie(request);
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...bytes));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Initialize response
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

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

  // ─── Security Headers ────────────────────────────────────────────────
  // CSP connect-src requires an origin (scheme+host+port), not a full path.
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";
  let backendOrigin = backendUrl;
  try {
    backendOrigin = new URL(backendUrl).origin;
  } catch {
    // If parsing fails, fall back to the raw value
  }

  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' https://vercel.live${isDev ? " 'unsafe-inline' 'unsafe-eval" : ` 'nonce-${nonce}'`}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com https://vercel.live https://vercel.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${backendOrigin} https://lh3.googleusercontent.com https://vercel.live https://*.vercel.app`,
    "frame-src 'self' https://sandbox.sslcommerz.com https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    !isDev ? "upgrade-insecure-requests" : null,
  ].filter(Boolean).join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("x-nonce", nonce);
  // Also set a cookie so the layout can read the nonce reliably
  // (headers() in server components may not see middleware-modified request headers)
  response.cookies.set("__csp_nonce", nonce, {
    httpOnly: false,
    secure: !isDev,
    sameSite: "strict",
    path: "/",
    maxAge: 60,
  });
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
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
