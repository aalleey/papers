import { createClient } from "@supabase/supabase-js";

// Ensure this file is never executed or bundled on the client!
export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin Supabase client (service role) cannot be accessed from the browser.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("placeholder")) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
