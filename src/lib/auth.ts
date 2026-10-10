import { cookies } from "next/headers";
import { createServerSupabaseClient } from "./supabase/server";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "teacher";
  fullName?: string;
}

const ADMIN_COOKIE = "pm_admin_session";

export async function getCurrentUser(): Promise<AuthUser | null> {
  // 1. Try Supabase session if Supabase is active
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // Check profile role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      return {
        id: session.user.id,
        email: session.user.email || "",
        role: (profile?.role as "admin" | "teacher") || "teacher",
        fullName: profile?.full_name || "User",
      };
    }
  }

  // 2. Check local/dev admin cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE)?.value;
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed && parsed.role === "admin") {
        return parsed as AuthUser;
      }
    } catch {
      // invalid cookie
    }
  }

  return null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.role === "admin";
}

export async function createAdminSession(email: string): Promise<AuthUser> {
  const user: AuthUser = {
    id: "admin-dev-user-0001",
    email,
    role: "admin",
    fullName: "System Administrator",
  };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return user;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
