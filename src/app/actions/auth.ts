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
