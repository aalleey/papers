import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubjectSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId") || searchParams.get("course_id") || undefined;
  const subjects = await db.getSubjects(courseId);
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = SubjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const subject = await db.createSubject({
    ...parsed.data,
    name_ur: parsed.data.name_ur ?? null,
  });
  return NextResponse.json({ success: true, subject });
}

export async function PUT(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
  }

  const updated = await db.updateSubject(id, data);
  return NextResponse.json({ success: true, subject: updated });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
  }

  const success = await db.deleteSubject(id);
  return NextResponse.json({ success });
}
