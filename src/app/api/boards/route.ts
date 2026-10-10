import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { BoardSchema } from "@/lib/validations";

export async function GET() {
  const boards = await db.getBoards();
  return NextResponse.json({ boards });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = BoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const board = await db.createBoard(parsed.data.name, parsed.data.name_ur);
  return NextResponse.json({ success: true, board });
}

export async function PUT(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const { id, name, name_ur } = body;
  if (!id || !name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  const updated = await db.updateBoard(id, name, name_ur);
  return NextResponse.json({ success: true, board: updated });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Board ID is required" }, { status: 400 });
  }

  const success = await db.deleteBoard(id);
  return NextResponse.json({ success });
}
