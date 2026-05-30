"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server-side admin check utility
 * Use this in Server Components and Server Actions
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    // throw new Error("Unauthorized");
    redirect("/");
 
  }

  return session;
}

/**
 * Check if current user is admin without redirecting
 */
export async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.role === "ADMIN";
}

/**
 * Get current session with role check
 */
export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}
