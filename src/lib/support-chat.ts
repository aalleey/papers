import fs from "fs";
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

// In-memory fallback when running on a read-only filesystem without Supabase migration
const globalForSupport = globalThis as unknown as {
  __pmSupportStore?: LocalSupportStore;
};

function readLocalStore(): LocalSupportStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.conversations) && Array.isArray(parsed.messages)) {
        globalForSupport.__pmSupportStore = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore read errors
  }
  if (!globalForSupport.__pmSupportStore) {
    globalForSupport.__pmSupportStore = { conversations: [], messages: [] };
  }
  return globalForSupport.__pmSupportStore;
}

function writeLocalStore(store: LocalSupportStore): void {
  globalForSupport.__pmSupportStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Serverless/read-only filesystem fallback stays in memory
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
    lastMessageAt: String(row.last_message_at || row.created_at || new Date().toISOString()),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
  };
}

function mapSupabaseMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderRole:
      row.sender_role === "admin" || row.sender_role === "system" ? row.sender_role : "user",
    senderName: String(row.sender_name || "Support"),
    content: String(row.content || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export const supportChatDb = {
  async getConversationByVisitor(
    visitorToken: string,
    userId?: string | null
  ): Promise<{ conversation: SupportConversation | null; messages: SupportMessage[] }> {
    const supabase = createAdminSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from("support_conversations")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (userId) {
          query = query.or(`visitor_token.eq.${visitorToken},user_id.eq.${userId}`);
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
        // Fallback to local store if table not migrated yet
      }
    }

    const store = readLocalStore();
    const matched = store.conversations
      .filter((c) => c.visitorToken === visitorToken || (userId && c.userId === userId))
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
        // Fallback to local store
      }
    }

    const store = readLocalStore();
    return store.conversations
      .filter((c) => !statusFilter || statusFilter === "all" || c.status === statusFilter)
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
        // Fallback to local store
      }
    }

    const store = readLocalStore();
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
            unread_by_user: 1,
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
                content:
                  "Thanks for contacting PaperWala Support! Our team has received your message and will reply shortly.",
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
        // Fallback to local store
      }
    }

    const store = readLocalStore();
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
      unreadByUser: 1,
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
      content:
        "Thanks for contacting PaperWala Support! Our team has received your message and will reply shortly.",
      createdAt: new Date(Date.now() + 100).toISOString(),
    };

    store.conversations.push(conv);
    store.messages.push(userMsg, systemMsg);
    writeLocalStore(store);

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
                  input.senderRole === "user" ? Number(convRow.unread_by_admin || 0) + 1 : 0,
                unread_by_user:
                  input.senderRole === "admin" ? Number(convRow.unread_by_user || 0) + 1 : 0,
                last_message_preview: preview,
                last_message_at: now,
                updated_at: now,
              })
              .eq("id", input.conversationId);

            return mapSupabaseMessage(msgRow);
          }
        }
      } catch {
        // Fallback to local store
      }
    }

    const store = readLocalStore();
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
    writeLocalStore(store);
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
        // Fallback to local store
      }
    }

    const store = readLocalStore();
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    if (reader === "admin") conv.unreadByAdmin = 0;
    else conv.unreadByUser = 0;
    writeLocalStore(store);
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
        // Fallback to local store
      }
    }

    const store = readLocalStore();
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (!conv) return null;
    conv.status = status;
    conv.updatedAt = now;
    writeLocalStore(store);
    return conv;
  },
};
