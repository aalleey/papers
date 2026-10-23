import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { PaymentSubmission, SubscriptionPlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const client = await getCurrentClient();
    if (!client) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { transactionRef, senderPhone, senderName, amount, planRequested, notes } = body;

    // Transaction ID is optional; admin can verify via the WhatsApp screenshot instead
    const tid = typeof transactionRef === "string" && transactionRef.trim() ? transactionRef.trim() : "Not provided";

    const paymentSubmission: PaymentSubmission = {
      method: "raast",
      raastId: "03092770207",
      transactionRef: tid,
      senderPhone: senderPhone?.trim() || client.phone || "",
      senderName: senderName?.trim() || client.fullName || "",
      amount: amount?.trim() || "2000",
      planRequested: (planRequested as SubscriptionPlanId) || (client.subscription?.planId as SubscriptionPlanId) || "standard",
      submittedAt: new Date().toISOString(),
      notes: notes?.trim() || "Raast payment awaiting admin verification.",
    };

    // Update client with payment proof and lock profile under pending_verification
    const updated = await db.updateClient(client.id, {
      paymentSubmission,
      isVerified: false,
      subscription: {
        ...client.subscription,
        status: "pending_verification",
      },
      notes: `[Raast TID: ${paymentSubmission.transactionRef} on 03092770207] ${notes?.trim() || ""}`,
    });

    return NextResponse.json({
      success: true,
      client: updated,
      message: "Payment receipt submitted successfully. Profile is under admin verification.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit payment verification." },
      { status: 500 }
    );
  }
}
