import { cookies } from "next/headers";
import { createServerSupabaseClient } from "./supabase/server";
import { ClientUser, SubscriptionPlanId, getPlanPermissions } from "./types";
import { db } from "./db";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "teacher";
  fullName?: string;
}

const ADMIN_COOKIE = "pm_admin_session";
const CLIENT_COOKIE = "pm_client_session";

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

  // 3. Check client cookie for default admin user
  const clientCookie = cookieStore.get(CLIENT_COOKIE)?.value;
  if (clientCookie) {
    try {
      const parsed = JSON.parse(clientCookie);
      if (parsed && parsed.email && parsed.email.toLowerCase() === "ali.khaliq50@gmail.com") {
        return {
          id: parsed.id || "admin-client-ali",
          email: parsed.email,
          role: "admin",
          fullName: parsed.fullName || "Ali Khaliq",
        };
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
  const isAli = email.toLowerCase() === "ali.khaliq50@gmail.com";
  const user: AuthUser = {
    id: isAli ? "admin-client-ali" : "admin-dev-user-0001",
    email,
    role: "admin",
    fullName: isAli ? "Ali Khaliq" : "System Administrator",
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

// =========================================================================
// CLIENT AUTHENTICATION & SUBSCRIPTION SESSION
// =========================================================================

export async function getCurrentClient(): Promise<ClientUser | null> {
  const cookieStore = await cookies();
  const clientCookie = cookieStore.get(CLIENT_COOKIE)?.value;
  if (clientCookie) {
    try {
      const parsed = JSON.parse(clientCookie) as ClientUser;
      if (parsed && parsed.role === "client") {
        // Query live database store to reflect any admin updates (plan, permissions, expiry)
        const live = (await db.getClientById(parsed.id)) || (await db.getClientByEmail(parsed.email));
        if (live) {
          return live;
        }
        return parsed;
      }
    } catch {
      // invalid cookie
    }
  }
  return null;
}

export async function createClientSession(clientData: {
  id?: string;
  email: string;
  fullName: string;
  academyName?: string | null;
  phone?: string | null;
  password?: string | null;
  planId?: SubscriptionPlanId;
  subscription?: Partial<ClientUser["subscription"]>;
  paymentSubmission?: ClientUser["paymentSubmission"];
  isVerified?: boolean;
}): Promise<ClientUser> {
  // planId left undefined for existing clients so their stored plan is preserved
  const plan = clientData.planId;

  // Persist into central DB store
  const user = await db.saveClient({
    id: clientData.id,
    email: clientData.email,
    fullName: clientData.fullName,
    academyName: clientData.academyName || "My Academy",
    phone: clientData.phone || null,
    password: clientData.password || null,
    planId: plan,
    subscription: clientData.subscription,
    paymentSubmission: clientData.paymentSubmission,
    isVerified: clientData.isVerified,
  });

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return user;
}

export async function updateClientSubscription(planId: SubscriptionPlanId): Promise<ClientUser | null> {
  const current = await getCurrentClient();
  if (!current) return null;

  const newSub = getPlanPermissions(planId);
  const updated = await db.updateClient(current.id, {
    subscription: newSub,
  });

  const finalUser = updated || { ...current, subscription: newSub };

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_COOKIE, JSON.stringify(finalUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return finalUser;
}

export async function clearClientSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_COOKIE);
}

