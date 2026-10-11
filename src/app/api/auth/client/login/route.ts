import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email or phone is required." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    // 1. Check if user exists in database
    const existing = await db.getClientByEmail(email);

    if (!existing) {
      return NextResponse.json(
        { error: "No account found with this email or phone. Please register first." },
        { status: 404 }
      );
    }

    // 2. Check password
    // If account has a stored password, verify it matches
    if (existing.password && existing.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // If account was created without a password (legacy demo), save the entered password
    if (!existing.password) {
      await db.updateClient(existing.id, { password });
    }

    // 3. Create active session for the verified client
    const client = await createClientSession({
      id: existing.id,
      email: existing.email,
      fullName: existing.fullName,
      academyName: existing.academyName,
      phone: existing.phone,
      password: existing.password || password,
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    return NextResponse.json({ error: "Failed to login. Please try again." }, { status: 500 });
  }
}
