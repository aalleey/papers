"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  User,
} from "lucide-react";
import type {
  SupportConversation,
  SupportMessage,
} from "@/lib/support-chat";

interface SupportStats {
  total: number;
  open: number;
  resolved: number;
  unread: number;
}

const QUICK_REPLIES = [
  "Assalam-o-Alaikum! Thanks for reaching out to PaperWala Support. How can we assist you today?",
  "Your monthly subscription has been verified and activated! Please refresh your browser to generate unlimited papers.",
  "You can select Class -> Subject -> Chapter from the 'Generate Paper' button in the top navbar.",
  "For Urdu Nastaliq & Math formulas, click 'Print / Save PDF' in the Paper Editor for crisp board-style output.",
];

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    total: 0,
    open: 0,
    resolved: 0,
    unread: 0,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/support-chat?mode=admin&status=${statusFilter}`);
      if (!res.ok) return;
      const data = await res.json();
      const list: SupportConversation[] = Array.isArray(data.conversations)
        ? data.conversations
        : [];
      setConversations(list);
      if (data.stats) setStats(data.stats);
      setSelectedId((prev) => prev || (list[0]?.id ?? null));
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter]);

  const loadThread = useCallback(async (convId: string, markRead = true) => {
    setLoadingThread(true);
    try {
      const res = await fetch(
        `/api/support-chat?mode=admin&conversationId=${encodeURIComponent(convId)}${
          markRead ? "&markRead=1" : ""
        }`
      );
      if (!res.ok) return;
      const data = await res.json();
      setActiveConv(data.conversation || null);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (markRead) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadByAdmin: 0 } : c))
        );
      }
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    setLoadingList(true);
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      loadThread(selectedId, true);
    } else {
      setActiveConv(null);
      setMessages([]);
    }
  }, [selectedId, loadThread]);

  // Poll every 5 seconds for live updates
  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
      if (selectedId) {
        loadThread(selectedId, true);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [loadConversations, loadThread, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.userName.toLowerCase().includes(q) ||
        (c.userEmail || "").toLowerCase().includes(q) ||
        (c.userPhone || "").toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_reply",
          conversationId: selectedId,
          content: replyText.trim(),
        }),
      });
      if (res.ok) {
        setReplyText("");
        await Promise.all([loadThread(selectedId, true), loadConversations()]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeConv || updatingStatus) return;
    const nextStatus = activeConv.status === "resolved" ? "open" : "resolved";
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_status",
          conversationId: activeConv.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        await loadConversations();
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <MessageCircle className="w-6 h-6" />
            </span>
            <span>Live Support Chat Inbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Reply to educators &amp; visitors in real time, verify payments, and resolve support tickets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadConversations();
            if (selectedId) loadThread(selectedId, true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-extrabold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Total Chats
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
            Open Tickets
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.open}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
            Unread Messages
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.unread}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
            Resolved
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.resolved}</p>
        </div>
      </div>

      {/* Split-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
        {/* Left Pane: Conversation List */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, phone, or topic..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              {(["all", "open", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[540px]">
            {loadingList ? (
              <div className="py-16 flex flex-col items-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-2 text-slate-500">
                <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No support conversations found.</p>
                <p className="text-[11px] text-slate-400">
                  Messages sent from the floating Chat Support widget will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/90 border-l-4 border-emerald-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {conv.userName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {conv.unreadByAdmin > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                            {conv.unreadByAdmin}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            conv.status === "resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {conv.status}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-indigo-700 truncate">
                      {conv.subject}
                    </span>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {conv.lastMessagePreview || "No messages yet"}
                    </p>

                    <span className="text-[10px] text-slate-400">
                      {new Date(conv.lastMessageAt).toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Thread */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 space-y-2">
              <MessageCircle className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                Select a conversation to view &amp; reply
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900">
                      <User className="w-4 h-4 text-emerald-600" />
                      {activeConv.userName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
                      {activeConv.subject}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    {activeConv.userEmail && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {activeConv.userEmail}
                      </span>
                    )}
                    {activeConv.userPhone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {activeConv.userPhone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      Started {new Date(activeConv.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={updatingStatus}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    activeConv.status === "resolved"
                      ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                      : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
                  }`}
                >
                  {activeConv.status === "resolved" ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Ticket</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </>
                  )}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40 max-h-[380px]">
                {loadingThread && messages.length === 0 ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    if (msg.senderRole === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                          {msg.senderName} &bull;{" "}
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[82%] whitespace-pre-wrap shadow-2xs ${
                            isAdmin
                              ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-br-sm"
                              : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies + Reply Form */}
              <div className="p-3.5 border-t border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                    Quick Replies:
                  </span>
                  {QUICK_REPLIES.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(qr)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      {qr.slice(0, 36)}...
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendReply} className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(e);
                      }
                    }}
                    placeholder="Write a reply to the educator... (Enter to send)"
                    className="flex-1 resize-none px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-45 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
