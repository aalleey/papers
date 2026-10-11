import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubscriptionPlanId } from "@/lib/types";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/admin/clients - Fetch registered clients with filtering & stats
export async function GET(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const planId = searchParams.get("plan") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const clients = await db.getClients({ search, planId, status });
    const allClients = await db.getClients();

    // Summary statistics for admin dashboard
    const stats = {
      total: allClients.length,
      active: allClients.filter((c) => c.subscription.status === "active").length,
      free: allClients.filter((c) => c.subscription.planId === "free").length,
      paid: allClients.filter((c) => c.subscription.planId !== "free").length,
      standard: allClients.filter((c) => c.subscription.planId === "standard").length,
      annual: allClients.filter((c) => c.subscription.planId === "annual").length,
      payAsYouGo: allClients.filter((c) => c.subscription.planId === "pay_as_you_go" || c.subscription.planId === "pay_per_paper").length,
      suspended: allClients.filter((c) => c.subscription.status === "suspended").length,
    };

    return NextResponse.json({ clients, stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load clients";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/clients - Register / Create a client manually from Admin Panel
export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, fullName, academyName, phone, password, planId, subscription, notes } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and Full Name are required to register an educator." },
        { status: 400 }
      );
    }

    // Check if client with this email already exists
    const existing = await db.getClientByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An educator account with this email already exists." },
        { status: 409 }
      );
    }

    const client = await db.saveClient({
      email,
      fullName,
      academyName: academyName || "Educator Academy",
      phone: phone || null,
      password: password || "eduPass" + Math.floor(1000 + Math.random() * 9000),
      planId: (planId as SubscriptionPlanId) || "free",
      subscription: subscription || undefined,
      notes: notes || null,
    });

    // Send Welcome Email to newly registered educator
    try {
      await sendWelcomeEmail(client);
    } catch (emailErr) {
      console.warn("Failed to dispatch welcome email from admin:", emailErr);
    }

    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create client";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
