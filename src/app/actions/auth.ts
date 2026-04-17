"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_for_development_only");

export async function setSecureAuthCookie(role: string) {
  const jwt = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set("swms_role", jwt, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: true, // Secure!
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSecureAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("swms_role");
}
