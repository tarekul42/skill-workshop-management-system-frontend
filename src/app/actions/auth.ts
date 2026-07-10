"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";

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
    .setExpirationTime("1d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set("swms_role", jwt, {
    path: "/",
    maxAge: 1 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSecureAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("swms_role");
}

export async function checkAuthSession() {
  const role = await getAuthRole();
  return role !== null;
}

export async function getAuthRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get("swms_role")?.value;
  if (!token) return null;

  try {
    const { payload } = await import("jose").then((m) => m.jwtVerify(token, getSecret()));
    return payload.role as string;
  } catch {
    return null;
  }
}

export async function getDemoCredentials() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001/api/v1";
    const res = await fetch(`${baseUrl}/auth/demo-credentials`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
