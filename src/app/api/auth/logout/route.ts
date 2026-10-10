import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
