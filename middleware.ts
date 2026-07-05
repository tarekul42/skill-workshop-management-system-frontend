import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

const PROTECTED_PREFIXES = ["/super-admin", "/admin", "/instructor", "/student"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("swms_role")?.value;

  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Authenticated user on auth page → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // Unauthenticated user on protected route → redirect to login
  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|icons/).*)",
  ],
};
