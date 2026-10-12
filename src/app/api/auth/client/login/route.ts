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

    // 1. Check if user is the default admin
    const isDefaultAdmin = email.trim().toLowerCase() === "ali.khaliq50@gmail.com";
    if (isDefaultAdmin) {
      if (password !== "laptop321") {
        return NextResponse.json(
          { error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }

      const { createAdminSession } = await import("@/lib/auth");
      await createAdminSession("ali.khaliq50@gmail.com");

      let existing = await db.getClientByEmail("ali.khaliq50@gmail.com");
      if (!existing) {
        existing = await db.saveClient({
          id: "admin-client-ali",
          email: "ali.khaliq50@gmail.com",
          fullName: "Ali Khaliq",
          academyName: "PaperWala Administration",
          phone: "0300-1234567",
          password: "laptop321",
          planId: "annual",
          subscription: {
            planId: "annual",
            planName: "Administrator Premium Plan",
            status: "active",
            expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
            paperCredits: 999999,
            canAutoBoardPattern: true,
            canCustomBranding: true,
            canExportAnswerKey: true,
            canFullBoardPaper: true,
            canUnlimitedExport: true,
            canAccessAllClasses: true,
            maxQuestionsPerPaper: 100,
          },
          isVerified: true,
        });
      }

      const client = await createClientSession({
        id: existing.id,
        email: existing.email,
        fullName: existing.fullName,
        academyName: existing.academyName,
        phone: existing.phone,
        password: "laptop321",
        subscription: existing.subscription,
        isVerified: true,
      });

      return NextResponse.json({
        success: true,
        client,
        isAdmin: true,
        isPendingVerification: false,
      });
    }

    // 2. Check if user exists in database
    const existing = await db.getClientByEmail(email);

    if (!existing) {
      return NextResponse.json(
        { error: "No account found with this email or phone. Please register first." },
        { status: 404 }
      );
    }

    // 3. Check password
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

    // 4. Create active session for the verified client
    const client = await createClientSession({
      id: existing.id,
      email: existing.email,
      fullName: existing.fullName,
      academyName: existing.academyName,
      phone: existing.phone,
      password: existing.password || password,
      subscription: existing.subscription,
      paymentSubmission: existing.paymentSubmission,
      isVerified: existing.isVerified,
    });

    return NextResponse.json({
      success: true,
      client,
      isPendingVerification: existing.subscription.status === "pending_verification" || existing.isVerified === false,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to login. Please try again." }, { status: 500 });
  }
}
