"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type {
  SupportConversation,
  SupportMessage,
} from "@/lib/support-chat";

const QUICK_TOPICS = [
  "Subscription & Payment",
  "Paper Generation",
  "Question Bank",
  "Technical Help",
];

export function SupportChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pre-fill user details if logged in
  const [loggedUser, setLoggedUser] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // New conversation form state
  const [userName, setUserName] = useState("");
  const [userContact, setUserContact] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [draft, setDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forceNewForm, setForceNewForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hideWidget = pathname.startsWith("/admin") || pathname === "/login";

  const fetchChat = useCallback(
    async (markRead: boolean) => {
      if (hideWidget) return;
      try {
        const res = await fetch(`/api/support-chat${markRead ? "?markRead=1" : ""}`);
        if (!res.ok) return;
        const data = await res.json();
        setConversation(data.conversation || null);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setUnreadCount(
          markRead ? 0 : Number(data.conversation?.unreadByUser || 0)
        );
      } catch {
        // ignore transient network errors
      }
    },
    [hideWidget]
  );

  // Load current logged-in client & initial chat state
  useEffect(() => {
    if (hideWidget) return;
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const [meRes] = await Promise.all([
          fetch("/api/auth/client/me").catch(() => null),
          fetchChat(false),
        ]);
        if (meRes && meRes.ok) {
          const meData = await meRes.json();
          if (!cancelled && meData.client) {
            setLoggedUser({
              fullName: meData.client.fullName,
              email: meData.client.email,
              phone: meData.client.phone,
            });
            setUserName(meData.client.fullName || "");
            setUserContact(meData.client.email || meData.client.phone || "");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [hideWidget, fetchChat]);

  // Poll for admin replies
  useEffect(() => {
    if (hideWidget) return;
    const intervalMs = isOpen ? 5000 : 25000;
    const timer = setInterval(() => {
      fetchChat(isOpen);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [hideWidget, isOpen, fetchChat]);

  // Mark read when opened & scroll to bottom
  useEffect(() => {
    if (isOpen) {
      fetchChat(true);
    }
  }, [isOpen, fetchChat]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (hideWidget) return null;

  const showStarterForm = !conversation || forceNewForm;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setErrorMsg(null);
    setSending(true);
    try {
      const contactTrim = userContact.trim();
      const isEmail = contactTrim.includes("@");
      const payload = showStarterForm
        ? {
            action: forceNewForm ? "new_conversation" : "send_message",
            userName: userName.trim() || loggedUser?.fullName || "Guest Educator",
            userEmail: isEmail ? contactTrim : loggedUser?.email || "",
            userPhone: !isEmail && contactTrim ? contactTrim : loggedUser?.phone || "",
            subject,
            content,
          }
        : {
            action: "send_message",
            conversationId: conversation?.id,
            content,
          };

      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not send message.");
        return;
      }

      setDraft("");
      setForceNewForm(false);
      await fetchChat(true);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Avoid overlapping the sticky bottom dock on /select-questions
  const positionClass =
    pathname === "/select-questions"
      ? "bottom-24 right-4 sm:bottom-24 sm:right-6"
      : "bottom-5 right-4 sm:bottom-6 sm:right-6";

  return (
    <div className={`fixed ${positionClass} z-50 print:hidden`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[390px] max-h-[78vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.3)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3.5 text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight truncate">
                    PaperWala Support
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
                </div>
                <p className="text-[11px] text-emerald-100 truncate">
                  Live help for teachers &amp; academies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {conversation && !forceNewForm && (
                <button
                  type="button"
                  onClick={() => setForceNewForm(true)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Start New Conversation"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close Support Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80 min-h-[260px] max-h-[420px]">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">Loading support chat...</span>
              </div>
            ) : showStarterForm ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assalam-o-Alaikum! How can we help?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Ask us about monthly subscriptions, payment verification, board patterns, Urdu/English paper export, or missing chapters.
                  </p>
                </div>

                {!loggedUser && (
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your Name (e.g. Sir Ahmed)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="Email or WhatsApp Number (optional)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Select Topic
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSubject(topic)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          subject === topic
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {forceNewForm && conversation && (
                  <button
                    type="button"
                    onClick={() => setForceNewForm(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    &larr; Back to existing conversation
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                  <span className="font-bold text-slate-700 truncate">
                    Topic: <span className="text-slate-900">{conversation.subject}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] shrink-0 ${
                      conversation.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {conversation.status === "resolved" ? "Resolved" : "Open"}
                  </span>
                </div>

                {messages.map((msg) => {
                  if (msg.senderRole === "system") {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 font-medium text-center max-w-[90%]">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isUser = msg.senderRole === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                        {isUser ? "You" : msg.senderName || "PaperWala Support"}
                      </span>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap shadow-2xs ${
                          isUser
                            ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {conversation.status === "resolved" && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-[11px] text-emerald-900">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Ticket marked resolved
                    </span>
                    <button
                      type="button"
                      onClick={() => setForceNewForm(true)}
                      className="font-black text-emerald-700 hover:underline cursor-pointer"
                    >
                      New Chat
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200/80 space-y-2 shrink-0"
          >
            {errorMsg && (
              <p className="text-[11px] font-bold text-rose-600 px-1">{errorMsg}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={
                  showStarterForm
                    ? "Type your question or message..."
                    : "Reply to PaperWala Support..."
                }
                className="flex-1 resize-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-45 text-white shadow-sm transition-all cursor-pointer shrink-0"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        id="btn-support-chat-toggle"
        aria-label={isOpen ? "Close Support Chat" : "Open Support Chat"}
        className="relative ml-auto flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_6px_0_0_#065f46,0_14px_28px_-4px_rgba(16,185,129,0.5),inset_0_2px_2px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">{isOpen ? "Close" : "Chat Support"}</span>

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
