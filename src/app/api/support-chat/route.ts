import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getCurrentClient, getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { supportChatDb } from "@/lib/support-chat";

export const dynamic = "force-dynamic";

const SUPPORT_COOKIE = "pm_support_token";

async function getOrCreateVisitorToken(
  fallbackToken?: string | null
): Promise<{ token: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SUPPORT_COOKIE)?.value;
  if (existing && existing.length >= 8) {
    return { token: existing, isNew: false };
  }
  if (fallbackToken && fallbackToken.trim().length >= 8) {
    return { token: fallbackToken.trim(), isNew: true };
  }
  return { token: crypto.randomUUID(), isNew: true };
}

function attachSupportCookie(res: NextResponse, token: string) {
  res.cookies.set(SUPPORT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}

// GET /api/support-chat
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  // Admin Inbox Queries
  if (mode === "admin") {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin role required." },
        { status: 401 }
      );
    }

    const conversationId = searchParams.get("conversationId");
    if (conversationId) {
      const { conversation, messages } =
        await supportChatDb.getConversationWithMessages(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }
      if (searchParams.get("markRead") === "1" && conversation.unreadByAdmin > 0) {
        await supportChatDb.markRead(conversationId, "admin");
        conversation.unreadByAdmin = 0;
      }
      return NextResponse.json({ conversation, messages });
    }

    const status = searchParams.get("status") || "all";
    const [filtered, all] = await Promise.all([
      supportChatDb.listAllConversations(status),
      supportChatDb.listAllConversations("all"),
    ]);

    const stats = {
      total: all.length,
      open: all.filter((c) => c.status === "open").length,
      resolved: all.filter((c) => c.status === "resolved").length,
      unread: all.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0),
    };

    return NextResponse.json({ conversations: filtered, stats });
  }

  // Visitor / Educator Query
  const client = await getCurrentClient();
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(SUPPORT_COOKIE)?.value || "";
  const queryToken =
    searchParams.get("visitorToken") || req.headers.get("x-support-token") || "";
  const visitorToken = cookieToken || queryToken;
  const conversationId = searchParams.get("conversationId") || null;

  if (!visitorToken && !client?.id && !conversationId) {
    return NextResponse.json({ conversation: null, messages: [] });
  }

  const { conversation, messages } = await supportChatDb.getConversationByVisitor(
    visitorToken || (client?.id ? `user:${client.id}` : ""),
    client?.id || null,
    conversationId
  );

  if (
    conversation &&
    searchParams.get("markRead") === "1" &&
    conversation.unreadByUser > 0
  ) {
    await supportChatDb.markRead(conversation.id, "user");
    conversation.unreadByUser = 0;
  }

  const res = NextResponse.json({
    conversation,
    messages,
    visitorToken: conversation?.visitorToken || visitorToken || undefined,
  });
  if (!cookieToken && (conversation?.visitorToken || visitorToken)) {
    attachSupportCookie(res, conversation?.visitorToken || visitorToken);
  }
  return res;
}

// POST /api/support-chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || "send_message");

    // 1. Admin Reply
    if (action === "admin_reply") {
      const isAdmin = await isCurrentUserAdmin();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized. Admin role required." },
          { status: 401 }
        );
      }
      const adminUser = await getCurrentUser();
      const conversationId = String(body.conversationId || "").trim();
      const content = String(body.content || "").trim();

      if (!conversationId || !content) {
        return NextResponse.json(
          { error: "Conversation ID and message content are required." },
          { status: 400 }
        );
      }

      const message = await supportChatDb.addMessage({
        conversationId,
        senderRole: "admin",
        senderName: adminUser?.fullName || "PaperWala Support",
        content: content.slice(0, 2000),
      });

      if (!message) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }
      const updated = await supportChatDb.getConversationWithMessages(conversationId);
      return NextResponse.json({
        message,
        conversation: updated.conversation,
        messages: updated.messages,
      });
    }

    // 2. Admin Status Toggle (open / resolved)
    if (action === "admin_status") {
      const isAdmin = await isCurrentUserAdmin();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized. Admin role required." },
          { status: 401 }
        );
      }
      const conversationId = String(body.conversationId || "").trim();
      const status = body.status === "resolved" ? "resolved" : "open";
      const updated = await supportChatDb.setStatus(conversationId, status);
      if (!updated) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({ conversation: updated });
    }

    // 3. Visitor / Educator Send Message or Start New Conversation
    const client = await getCurrentClient();
    const clientTokenHint =
      typeof body.visitorToken === "string"
        ? body.visitorToken
        : req.headers.get("x-support-token");
    const { token, isNew } = await getOrCreateVisitorToken(clientTokenHint);
    const content = String(body.content || "").trim();
    if (!content) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const forceNew = action === "new_conversation";
    const requestedConvId =
      typeof body.conversationId === "string" && body.conversationId.trim()
        ? body.conversationId.trim()
        : null;
    let existingConv = null;

    if (!forceNew) {
      const lookup = await supportChatDb.getConversationByVisitor(
        token,
        client?.id || null,
        requestedConvId
      );
      existingConv = lookup.conversation;
    }

    if (
      existingConv &&
      (!requestedConvId || requestedConvId === existingConv.id)
    ) {
      const senderName =
        client?.fullName ||
        existingConv.userName ||
        String(body.userName || "Guest Educator");
      const message = await supportChatDb.addMessage({
        conversationId: existingConv.id,
        senderRole: "user",
        senderName,
        content: content.slice(0, 2000),
      });

      const updated = await supportChatDb.getConversationWithMessages(
        existingConv.id
      );

      const res = NextResponse.json({
        conversation: updated.conversation || existingConv,
        messages: updated.messages,
        message,
        visitorToken: existingConv.visitorToken || token,
      });
      if (isNew) attachSupportCookie(res, existingConv.visitorToken || token);
      return res;
    }

    // Create new conversation
    const userName =
      client?.fullName || String(body.userName || "").trim() || "Guest Educator";
    const userEmail =
      client?.email || (String(body.userEmail || "").trim() || null);
    const userPhone =
      client?.phone || (String(body.userPhone || "").trim() || null);
    const subject = String(body.subject || "").trim() || "General Support";

    const created = await supportChatDb.createConversationWithMessage({
      visitorToken: token,
      userId: client?.id || null,
      userName,
      userEmail,
      userPhone,
      subject,
      content: content.slice(0, 2000),
    });

    const res = NextResponse.json(
      {
        ...created,
        visitorToken: token,
      },
      { status: 201 }
    );
    if (isNew) attachSupportCookie(res, token);
    return res;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process chat message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
