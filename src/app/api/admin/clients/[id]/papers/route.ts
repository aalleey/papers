import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/clients/[id]/papers - admin view of a client's profile + paper history
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  const { id } = await params;
  const client = await db.getClientById(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const [papers, stats] = await Promise.all([
    db.getPapersByClient(id),
    db.getClientPaperStats(id),
  ]);

  return NextResponse.json({ client, papers, stats });
}
