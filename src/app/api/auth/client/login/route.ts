import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Client Authentication
    // Allow any valid email or test demo accounts
    const client = await createClientSession({
      email,
      fullName: body.fullName || email.split("@")[0],
      academyName: body.academyName || "Educator Academy",
      planId: body.planId || "free",
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
