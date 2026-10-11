import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient, updateClientSubscription, createClientSession } from "@/lib/auth";
import { SubscriptionPlanId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    let client = await getCurrentClient();
    if (!client) {
      // If not logged in yet, auto-create a client session with this plan
      client = await createClientSession({
        email: body.email || "guest.teacher@paperwala.pk",
        fullName: body.fullName || "Guest Educator",
        academyName: body.academyName || "My Academy",
        planId: planId as SubscriptionPlanId,
      });
      return NextResponse.json({ success: true, client });
    }

    const updated = await updateClientSubscription(planId as SubscriptionPlanId);
    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
