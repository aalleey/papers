import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth";
import { SubscriptionPlanId } from "@/lib/types";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, academyName, phone, planId } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const client = await createClientSession({
      email,
      fullName,
      academyName: academyName || "My Academy",
      phone: phone || null,
      planId: (planId as SubscriptionPlanId) || "free",
    });

    // Send Welcome Email to the newly registered educator
    try {
      await sendWelcomeEmail(client);
    } catch (emailErr) {
      console.warn("Failed to dispatch welcome email:", emailErr);
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
