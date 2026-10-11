import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth";
import { SubscriptionPlanId } from "@/lib/types";
import { sendWelcomeEmail } from "@/lib/email";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, academyName, phone, password, planId } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Name and Email are required." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await db.getClientByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const client = await createClientSession({
      email,
      fullName,
      academyName: academyName || "My Academy",
      phone: phone || null,
      password: password || null,
      planId: (planId as SubscriptionPlanId) || "standard",
      subscription: {
        status: "pending_verification",
      },
      isVerified: false,
    });

    // Send Welcome Email to the newly registered educator
    try {
      await sendWelcomeEmail(client);
    } catch (emailErr) {
      console.warn("Failed to dispatch welcome email:", emailErr);
    }

    return NextResponse.json({ success: true, client, requireVerification: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
