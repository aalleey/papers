import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type SupportSenderRole = "user" | "admin" | "system";
export type SupportConversationStatus = "open" | "resolved";

export interface SupportConversation {
  id: string;
  visitorToken: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  subject: string;
  status: SupportConversationStatus;
  unreadByAdmin: number;
  unreadByUser: number;
  lastMessagePreview: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderRole: SupportSenderRole;
  senderName: string;
  content: string;
  createdAt: string;
}

interface LocalSupportStore {
  conversations: SupportConversation[];
  messages: SupportMessage[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "support-chat.json");
const TMP_FILE = path.join(os.tmpdir(), "paperwala-support-chat.json");
const SUPABASE_FALLBACK_ROW_ID = "__system_support_chat_store__";

// In-memory cache across hot reloads / warm serverless invocations
const globalForSupport = globalThis as unknown as {
  __pmSupportStore?: LocalSupportStore;
};

function readDiskStore(): LocalSupportStore {
  for (const filePath of [DATA_FILE, TMP_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.conversations) &&
          Array.isArray(parsed.messages)
        ) {
          globalForSupport.__pmSupportStore = parsed;
          return parsed;
        }
      }
    } catch {
      // try next path
    }
  }
  if (!globalForSupport.__pmSupportStore) {
    globalForSupport.__pmSupportStore = { conversations: [], messages: [] };
  }
  return globalForSupport.__pmSupportStore;
}

function writeDiskStore(store: LocalSupportStore): void {
  globalForSupport.__pmSupportStore = store;
  const serialized = JSON.stringify(store, null, 2);

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, serialized, "utf8");
  } catch {
    // Read-only cwd on Vercel serverless; fall through to /tmp
  }

  try {
    fs.writeFileSync(TMP_FILE, serialized, "utf8");
  } catch {
    // ignore tmp write errors
  }
}

/**
 * Reads the persistent store from Supabase `clients` JSONB row when
 * `support_conversations` table is not migrated yet, merging with disk/memory.
 */
async function readPersistentStore(): Promise<LocalSupportStore> {
  const local = readDiskStore();
  const supabase = createAdminSupabaseClient();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("clients")
      .select("subscription")
      .eq("id", SUPABASE_FALLBACK_ROW_ID)
      .maybeSingle();

    if (!error && data && data.subscription) {
      const sub = data.subscription as unknown as Partial<LocalSupportStore>;
      if (Array.isArray(sub.conversations) && Array.isArray(sub.messages)) {
        // Merge remote + local so no in-flight message is ever lost
        const convMap = new Map<string, SupportConversation>();
        for (const c of sub.conversations) convMap.set(c.id, c);
        for (const c of local.conversations) {
          const existing = convMap.get(c.id);
          if (!existing || c.updatedAt >= existing.updatedAt) {
            convMap.set(c.id, c);
          }
        }

        const msgMap = new Map<string, SupportMessage>();
        for (const m of sub.messages) msgMap.set(m.id, m);
        for (const m of local.messages) msgMap.set(m.id, m);

        const merged: LocalSupportStore = {
          conversations: Array.from(convMap.values()),
          messages: Array.from(msgMap.values()),
        };
        writeDiskStore(merged);
        return merged;
      }
    }
  } catch {
    // ignore and return local
  }

  return local;
}

async function writePersistentStore(store: LocalSupportStore): Promise<void> {
  writeDiskStore(store);
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("clients").upsert({
      id: SUPABASE_FALLBACK_ROW_ID,
      email: "support-store@internal.paperwala.world",
      full_name: "PaperWala Support Store",
      academy_name: "System Internal",
      phone: "03473576122",
      role: "support_store",
      environment: "support_store",
      subscription: {
        conversations: store.conversations.slice(-300),
        messages: store.messages.slice(-2000),
      },
      updated_at: new Date().toISOString(),
    });
  } catch {
    // ignore if clients table schema differs
  }
}

function mapSupabaseConversation(row: Record<string, unknown>): SupportConversation {
  return {
    id: String(row.id),
    visitorToken: String(row.visitor_token || ""),
    userId: row.user_id ? String(row.user_id) : null,
    userName: String(row.user_name || "Guest Educator"),
    userEmail: row.user_email ? String(row.user_email) : null,
    userPhone: row.user_phone ? String(row.user_phone) : null,
    subject: String(row.subject || "General Support"),
    status: row.status === "resolved" ? "resolved" : "open",
    unreadByAdmin: Number(row.unread_by_admin || 0),
    unreadByUser: Number(row.unread_by_user || 0),
    lastMessagePreview: String(row.last_message_preview || ""),
    lastMessageAt: String(
      row.last_message_at || row.created_at || new Date().toISOString()
    ),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
  };
}

function mapSupabaseMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderRole:
      row.sender_role === "admin" || row.sender_role === "system"
        ? row.sender_role
        : "user",
    senderName: String(row.sender_name || "Support"),
    content: String(row.content || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export const supportChatDb = {
  async getConversationByVisitor(
    visitorToken: string,
    userId?: string | null,
    conversationId?: string | null
  ): Promise<{ conversation: SupportConversation | null; messages: SupportMessage[] }> {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from("support_conversations")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (conversationId) {
          query = query.eq("id", conversationId);
        } else if (userId && visitorToken) {
          query = query.or(`visitor_token.eq.${visitorToken},user_id.eq.${userId}`);
        } else if (userId) {
          query = query.eq("user_id", userId);
        } else {
          query = query.eq("visitor_token", visitorToken);
        }

        const { data: convRows, error } = await query;
        if (!error && convRows) {
          const conv = convRows[0] ? mapSupabaseConversation(convRows[0]) : null;
          if (!conv) return { conversation: null, messages: [] };

          const { data: msgRows } = await supabase
            .from("support_messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          return {
            conversation: conv,
            messages: (msgRows || []).map(mapSupabaseMessage),
          };
        }
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const matched = store.conversations
      .filter(
        (c) =>
          (conversationId && c.id === conversationId) ||
          (visitorToken && c.visitorToken === visitorToken) ||
          (userId && c.userId === userId)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

    if (!matched) return { conversation: null, messages: [] };
    const messages = store.messages
      .filter((m) => m.conversationId === matched.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return { conversation: matched, messages };
  },

  async listAllConversations(statusFilter?: string): Promise<SupportConversation[]> {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from("support_conversations")
          .select("*")
          .order("last_message_at", { ascending: false });

        if (statusFilter === "open" || statusFilter === "resolved") {
          query = query.eq("status", statusFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(mapSupabaseConversation);
        }
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    return store.conversations
      .filter(
        (c) => !statusFilter || statusFilter === "all" || c.status === statusFilter
      )
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },

  async getConversationWithMessages(
    conversationId: string
  ): Promise<{ conversation: SupportConversation | null; messages: SupportMessage[] }> {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        const { data: convRow, error } = await supabase
          .from("support_conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (!error && convRow) {
          const { data: msgRows } = await supabase
            .from("support_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

          return {
            conversation: mapSupabaseConversation(convRow),
            messages: (msgRows || []).map(mapSupabaseMessage),
          };
        }
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const conv = store.conversations.find((c) => c.id === conversationId) || null;
    const messages = conv
      ? store.messages
          .filter((m) => m.conversationId === conv.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : [];

    return { conversation: conv, messages };
  },

  async createConversationWithMessage(input: {
    visitorToken: string;
    userId?: string | null;
    userName: string;
    userEmail?: string | null;
    userPhone?: string | null;
    subject: string;
    content: string;
  }): Promise<{ conversation: SupportConversation; messages: SupportMessage[] }> {
    const now = new Date().toISOString();
    const preview = input.content.slice(0, 140);
    const autoReplyText =
      "Assalam-o-Alaikum! Thank you for messaging PaperWala Support. Our team has received your message and will reply shortly. For instant payment verification or urgent help, you can also tap the WhatsApp button above (03473576122).";

    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        const { data: convRow, error: convErr } = await supabase
          .from("support_conversations")
          .insert({
            visitor_token: input.visitorToken,
            user_id: input.userId || null,
            user_name: input.userName,
            user_email: input.userEmail || null,
            user_phone: input.userPhone || null,
            subject: input.subject,
            status: "open",
            unread_by_admin: 1,
            unread_by_user: 0,
            last_message_preview: preview,
            last_message_at: now,
            created_at: now,
            updated_at: now,
          })
          .select("*")
          .single();

        if (!convErr && convRow) {
          const conv = mapSupabaseConversation(convRow);
          const { data: msgRows } = await supabase
            .from("support_messages")
            .insert([
              {
                conversation_id: conv.id,
                sender_role: "user",
                sender_name: input.userName,
                content: input.content,
                created_at: now,
              },
              {
                conversation_id: conv.id,
                sender_role: "system",
                sender_name: "PaperWala Support",
                content: autoReplyText,
                created_at: new Date(Date.now() + 100).toISOString(),
              },
            ])
            .select("*");

          return {
            conversation: conv,
            messages: (msgRows || []).map(mapSupabaseMessage),
          };
        }
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const conv: SupportConversation = {
      id: crypto.randomUUID(),
      visitorToken: input.visitorToken,
      userId: input.userId || null,
      userName: input.userName,
      userEmail: input.userEmail || null,
      userPhone: input.userPhone || null,
      subject: input.subject,
      status: "open",
      unreadByAdmin: 1,
      unreadByUser: 0,
      lastMessagePreview: preview,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };
    const userMsg: SupportMessage = {
      id: crypto.randomUUID(),
      conversationId: conv.id,
      senderRole: "user",
      senderName: input.userName,
      content: input.content,
      createdAt: now,
    };
    const systemMsg: SupportMessage = {
      id: crypto.randomUUID(),
      conversationId: conv.id,
      senderRole: "system",
      senderName: "PaperWala Support",
      content: autoReplyText,
      createdAt: new Date(Date.now() + 100).toISOString(),
    };

    store.conversations.push(conv);
    store.messages.push(userMsg, systemMsg);
    await writePersistentStore(store);

    return { conversation: conv, messages: [userMsg, systemMsg] };
  },

  async addMessage(input: {
    conversationId: string;
    senderRole: SupportSenderRole;
    senderName: string;
    content: string;
  }): Promise<SupportMessage | null> {
    const now = new Date().toISOString();
    const preview = input.content.slice(0, 140);

    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        const { data: convRow } = await supabase
          .from("support_conversations")
          .select("*")
          .eq("id", input.conversationId)
          .single();

        if (convRow) {
          const { data: msgRow, error: msgErr } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: input.conversationId,
              sender_role: input.senderRole,
              sender_name: input.senderName,
              content: input.content,
              created_at: now,
            })
            .select("*")
            .single();

          if (!msgErr && msgRow) {
            await supabase
              .from("support_conversations")
              .update({
                status: "open",
                unread_by_admin:
                  input.senderRole === "user"
                    ? Number(convRow.unread_by_admin || 0) + 1
                    : 0,
                unread_by_user:
                  input.senderRole === "admin"
                    ? Number(convRow.unread_by_user || 0) + 1
                    : 0,
                last_message_preview: preview,
                last_message_at: now,
                updated_at: now,
              })
              .eq("id", input.conversationId);

            return mapSupabaseMessage(msgRow);
          }
        }
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const conv = store.conversations.find((c) => c.id === input.conversationId);
    if (!conv) return null;

    const msg: SupportMessage = {
      id: crypto.randomUUID(),
      conversationId: input.conversationId,
      senderRole: input.senderRole,
      senderName: input.senderName,
      content: input.content,
      createdAt: now,
    };

    conv.status = "open";
    if (input.senderRole === "user") {
      conv.unreadByAdmin += 1;
      conv.unreadByUser = 0;
    } else if (input.senderRole === "admin") {
      conv.unreadByUser += 1;
      conv.unreadByAdmin = 0;
    }
    conv.lastMessagePreview = preview;
    conv.lastMessageAt = now;
    conv.updatedAt = now;

    store.messages.push(msg);
    await writePersistentStore(store);
    return msg;
  },

  async markRead(conversationId: string, reader: "user" | "admin"): Promise<void> {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        const update =
          reader === "admin" ? { unread_by_admin: 0 } : { unread_by_user: 0 };
        const { error } = await supabase
          .from("support_conversations")
          .update(update)
          .eq("id", conversationId);
        if (!error) return;
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    if (reader === "admin") conv.unreadByAdmin = 0;
    else conv.unreadByUser = 0;
    await writePersistentStore(store);
  },

  async setStatus(
    conversationId: string,
    status: SupportConversationStatus
  ): Promise<SupportConversation | null> {
    const now = new Date().toISOString();
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("support_conversations")
          .update({ status, updated_at: now })
          .eq("id", conversationId)
          .select("*")
          .single();
        if (!error && data) return mapSupabaseConversation(data);
      } catch {
        // Fallback to persistent store
      }
    }

    const store = await readPersistentStore();
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (!conv) return null;
    conv.status = status;
    conv.updatedAt = now;
    await writePersistentStore(store);
    return conv;
  },
};
