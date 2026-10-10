import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopicSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") || searchParams.get("chapter_id") || undefined;
  const topics = await db.getTopics(chapterId);
  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = TopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const topic = await db.createTopic({
    ...parsed.data,
    title_ur: parsed.data.title_ur ?? null,
  });
  return NextResponse.json({ success: true, topic });
}

export async function PUT(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
  }

  const updated = await db.updateTopic(id, data);
  return NextResponse.json({ success: true, topic: updated });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
  }

  const success = await db.deleteTopic(id);
  return NextResponse.json({ success });
}
