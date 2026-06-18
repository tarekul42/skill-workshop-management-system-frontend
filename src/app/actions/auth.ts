"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { ROLE_COOKIE, AUTH_COOKIE_EXPIRES } from "@/lib/constants";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set. Cannot sign auth cookie.");
  }
  return new TextEncoder().encode(secret);
};

export async function setSecureAuthCookie(role: string) {
  const jwt = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_COOKIE_EXPIRES)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ROLE_COOKIE, jwt, {
    path: "/",
    maxAge: 1 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSecureAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ROLE_COOKIE);
}

export async function checkAuthSession() {
  const cookieStore = await cookies();
  return cookieStore.has(ROLE_COOKIE);
}

export async function getAuthRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ROLE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await import("jose").then((m) => m.jwtVerify(token, getSecret()));
    return payload.role as string;
  } catch {
    return null;
  }
}
