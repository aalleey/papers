import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateWelcomeEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/admin/emails/preview?clientId=... or ?email=...
// Returns the rendered HTML of the welcome email for browser preview
export async function GET(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const email = searchParams.get("email");

  let client = clientId ? await db.getClientById(clientId) : null;
  if (!client && email) {
    client = await db.getClientByEmail(email);
  }

  // If not specified, preview with first client or default
  if (!client) {
    const clients = await db.getClients();
    client = clients[0] || null;
  }

  if (!client) {
    return NextResponse.json({ error: "No client available to preview." }, { status: 404 });
  }

  const html = generateWelcomeEmailHtml(client);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
