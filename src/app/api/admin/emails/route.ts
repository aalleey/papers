import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/admin/emails - Retrieve outgoing email records
export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const emails = await db.getEmails(100);
    return NextResponse.json({ emails });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load email outbox";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/emails - Resend welcome email on demand to a client
export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const { clientId, email } = await req.json();
    let targetClient = clientId ? await db.getClientById(clientId) : null;
    if (!targetClient && email) {
      targetClient = await db.getClientByEmail(email);
    }

    if (!targetClient) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const result = await sendWelcomeEmail(targetClient);
    return NextResponse.json({
      success: true,
      message: `Welcome email dispatched to ${targetClient.email}`,
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to resend email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
