import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await getCurrentClient();
    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch client profile" }, { status: 500 });
  }
}
