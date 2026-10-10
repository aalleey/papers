import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChapterSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId") || searchParams.get("subject_id") || undefined;
  const chapters = await db.getChapters(subjectId);
  return NextResponse.json({ chapters });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ChapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const chapter = await db.createChapter({
    ...parsed.data,
    title_ur: parsed.data.title_ur ?? null,
  });
  return NextResponse.json({ success: true, chapter });
}

export async function PUT(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
  }

  const updated = await db.updateChapter(id, data);
  return NextResponse.json({ success: true, chapter: updated });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
  }

  const success = await db.deleteChapter(id);
  return NextResponse.json({ success });
}
