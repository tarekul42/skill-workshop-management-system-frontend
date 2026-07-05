import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_COOKIE = "swms_role";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

const PROTECTED_PREFIXES = ["/super-admin", "/admin", "/instructor", "/student"];

const ROLE_ROUTES: Record<string, string> = {
  "super-admin": "SUPER_ADMIN",
  admin: "ADMIN",
  instructor: "INSTRUCTOR",
  student: "STUDENT",
};

async function getVerifiedRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(ROLE_COOKIE)?.value;
  if (!token) return null;

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("[MIDDLEWARE] JWT_SECRET environment variable is not set.");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await getVerifiedRole(request);

  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Authenticated user on auth page → redirect to their dashboard
  if (role && isAuthPage) {
    const roleKey = role.toLowerCase().replace("_", "-");
    return NextResponse.redirect(new URL(`/${roleKey}/dashboard`, request.url));
  }

  // Unauthenticated user on protected route → redirect to login
  if (!role && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on wrong role's dashboard → redirect to correct one
  if (role && isProtected) {
    const expectedRole = PROTECTED_PREFIXES.find((p) => pathname.startsWith(`/${p}`));
    if (expectedRole && ROLE_ROUTES[expectedRole] !== role) {
      const correctRole = role.toLowerCase().replace("_", "-");
      const dashboardUrl = new URL(`/${correctRole}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|icons/).*)",
  ],
};
