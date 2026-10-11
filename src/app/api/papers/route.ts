import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPaidSubscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/papers - the logged-in client's own paper history + stats
export async function GET() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Login required.", requireLogin: true }, { status: 401 });
  }

  const [papers, stats] = await Promise.all([
    db.getPapersByClient(client.id),
    db.getClientPaperStats(client.id),
  ]);

  return NextResponse.json({ client, papers, stats });
}

// POST /api/papers - record a paper the client just generated / printed
export async function POST(req: NextRequest) {
  const [client, admin] = await Promise.all([
    getCurrentClient(),
    getCurrentUser(),
  ]);

  if (!client && !admin) {
    return NextResponse.json({ error: "Login required.", requireLogin: true }, { status: 401 });
  }

  if (client && !admin && (client.subscription.status === "pending_verification" || client.isVerified === false)) {
    return NextResponse.json(
      {
        error: "Your account is on hold pending admin payment verification.",
        pendingVerification: true,
      },
      { status: 403 }
    );
  }

  if (client && !isPaidSubscriber(client, admin)) {
    return NextResponse.json(
      {
        error: "Paid subscription required. Only registered users with an active paid subscription can generate or save papers.",
        requireSubscription: true,
      },
      { status: 403 }
    );
  }

  const targetClientId = client ? client.id : "admin";

  try {
    const b = await req.json();
    const mcqCount = Math.max(0, Number(b.mcqCount) || 0);
    const shortCount = Math.max(0, Number(b.shortCount) || 0);
    const longCount = Math.max(0, Number(b.longCount) || 0);

    const language = ["Bilingual", "English", "Urdu"].includes(b.languageMode)
      ? b.languageMode
      : "Bilingual";
    const exportMode = ["all", "questions", "key"].includes(b.exportMode) ? b.exportMode : "all";

    const paper = await db.savePaper({
      clientId: targetClientId,
      title: String(b.title || "Untitled Paper").slice(0, 150),
      institution: String(b.institution || client?.academyName || "").slice(0, 150),
      subject: String(b.subject || "General").slice(0, 80),
      className: String(b.className || "").slice(0, 30),
      syllabus: String(b.syllabus || "").slice(0, 200),
      mcqCount,
      shortCount,
      longCount,
      questionCount: mcqCount + shortCount + longCount,
      totalMarks: Math.max(0, Number(b.totalMarks) || 0),
      languageMode: language,
      version: String(b.version || "A").slice(0, 2),
      exportMode,
    });

    // Pay-as-you-go: consume one paper credit per generated paper
    let updatedClient = client;
    if (client && client.subscription.planId === "pay_as_you_go" && client.subscription.paperCredits > 0) {
      const updated = await db.updateClient(client.id, {
        subscription: {
          ...client.subscription,
          paperCredits: client.subscription.paperCredits - 1,
        },
      });
      if (updated) updatedClient = updated;
    }

    return NextResponse.json({ success: true, paper, client: updatedClient }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save paper";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
