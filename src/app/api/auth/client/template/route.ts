import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizePaperTemplate } from "@/lib/paper-template";

export const dynamic = "force-dynamic";

// GET /api/auth/client/template - the logged-in client's saved paper template (or null)
export async function GET() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  return NextResponse.json({ template: client.subscription?.paperTemplate ?? null });
}

// PUT /api/auth/client/template - save the template (body: { template }), or { reset: true } to clear
export async function PUT(req: NextRequest) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const template = body?.reset ? null : sanitizePaperTemplate(body?.template);

    const updated = await db.updateClient(client.id, {
      subscription: { ...client.subscription, paperTemplate: template },
    });
    if (!updated) {
      return NextResponse.json({ error: "Could not save template." }, { status: 500 });
    }
    return NextResponse.json({ success: true, template: updated.subscription?.paperTemplate ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to save template." }, { status: 500 });
  }
}
