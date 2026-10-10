import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const classes = await db.getClasses();
  return NextResponse.json({ classes });
}
