import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanPermissions, SubscriptionPlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/admin/clients/[id] - Fetch detailed profile of a specific client
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

  return NextResponse.json({ client });
}

// PUT /api/admin/clients/[id] - Update client profile, plan, and fine-grained permissions
export async function PUT(
  req: NextRequest,
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

  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      academyName,
      notes,
      planId,
      status,
      expiresAt,
      paperCredits,
      permissions,
    } = body;

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase() !== client.email.toLowerCase()) {
      const emailConflict = await db.getClientByEmail(email);
      if (emailConflict && emailConflict.id !== id) {
        return NextResponse.json(
          { error: "Another educator already uses this email address." },
          { status: 409 }
        );
      }
    }

    // Determine target subscription base
    let targetSub = { ...client.subscription };
    if (planId && planId !== client.subscription.planId) {
      // Re-initialize permissions preset for the new plan
      const basePlan = getPlanPermissions(planId as SubscriptionPlanId);
      targetSub = {
        ...basePlan,
        ...targetSub,
        planId: basePlan.planId,
        planName: basePlan.planName,
        canAutoBoardPattern: basePlan.canAutoBoardPattern,
        canCustomBranding: basePlan.canCustomBranding,
        canExportAnswerKey: basePlan.canExportAnswerKey,
        canFullBoardPaper: basePlan.canFullBoardPaper,
        canUnlimitedExport: basePlan.canUnlimitedExport,
        canAccessAllClasses: basePlan.canAccessAllClasses,
        maxQuestionsPerPaper: basePlan.maxQuestionsPerPaper,
      };
      if (basePlan.expiresAt) targetSub.expiresAt = basePlan.expiresAt;
      if (basePlan.paperCredits !== undefined) targetSub.paperCredits = basePlan.paperCredits;
    }

    // Override status if provided
    if (status) {
      targetSub.status = status;
    }

    // Override expiry date if provided
    if (expiresAt !== undefined) {
      targetSub.expiresAt = expiresAt;
    }

    // Override paper credits if provided
    if (paperCredits !== undefined) {
      targetSub.paperCredits = Number(paperCredits);
    }

    // Override fine-grained permissions if provided
    if (permissions && typeof permissions === "object") {
      if (permissions.canAutoBoardPattern !== undefined) {
        targetSub.canAutoBoardPattern = Boolean(permissions.canAutoBoardPattern);
      }
      if (permissions.canCustomBranding !== undefined) {
        targetSub.canCustomBranding = Boolean(permissions.canCustomBranding);
      }
      if (permissions.canExportAnswerKey !== undefined) {
        targetSub.canExportAnswerKey = Boolean(permissions.canExportAnswerKey);
      }
      if (permissions.canFullBoardPaper !== undefined) {
        targetSub.canFullBoardPaper = Boolean(permissions.canFullBoardPaper);
      }
      if (permissions.canUnlimitedExport !== undefined) {
        targetSub.canUnlimitedExport = Boolean(permissions.canUnlimitedExport);
      }
      if (permissions.canAccessAllClasses !== undefined) {
        targetSub.canAccessAllClasses = Boolean(permissions.canAccessAllClasses);
      }
      if (permissions.maxQuestionsPerPaper !== undefined) {
        targetSub.maxQuestionsPerPaper = Number(permissions.maxQuestionsPerPaper);
      }
    }

    const updated = await db.updateClient(id, {
      fullName: fullName !== undefined ? fullName : client.fullName,
      email: email !== undefined ? email : client.email,
      phone: phone !== undefined ? phone : client.phone,
      academyName: academyName !== undefined ? academyName : client.academyName,
      notes: notes !== undefined ? notes : client.notes,
      subscription: targetSub,
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update client";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/clients/[id] - Remove client profile
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await db.deleteClient(id);

  if (!deleted) {
    return NextResponse.json({ error: "Client not found or already deleted." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Client deleted successfully." });
}
