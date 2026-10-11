import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Client Authentication
    // Allow any valid email or test demo accounts
    // Existing accounts keep their stored profile, plan and history.
    const existing = await db.getClientByEmail(email);
    const client = existing
      ? await createClientSession({ email: existing.email, fullName: existing.fullName })
      : await createClientSession({
          email,
          fullName: body.fullName || email.split("@")[0],
          academyName: body.academyName || "Educator Academy",
          planId: body.planId || undefined,
        });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
