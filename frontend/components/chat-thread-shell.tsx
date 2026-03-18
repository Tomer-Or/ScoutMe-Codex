"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, SendHorizontal } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiGetConversation, apiSendMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ConversationDetail } from "@/lib/types";

function formatMessageTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function isAuthError(message: string) {
  return message === "Invalid token" || message === "Authentication required" || message === "User not found";
}

export function ChatThreadShell({ conversationId }: { conversationId: string }) {
  const { isReady, token, user, setAuth } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    apiGetConversation(token, conversationId)
      .then((result) => {
        setConversation(result);
        setError(null);
        setSessionExpired(false);
      })
      .catch((loadError) => {
        const message = loadError instanceof Error ? loadError.message : "Failed to load conversation";
        if (isAuthError(message)) {
          setSessionExpired(true);
          setAuth(null);
          setError(null);
          return;
        }
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [conversationId, isReady, token, user, setAuth]);

  const subtitle = useMemo(() => {
    if (!conversation) return null;
    return [conversation.other_user_position, conversation.other_user_location].filter(Boolean).join(" • ");
  }, [conversation]);

  async function handleSendMessage() {
    if (!token || !conversation || !draft.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const message = await apiSendMessage(token, String(conversation.id), draft);
      setConversation({
        ...conversation,
        messages: [...conversation.messages, message]
      });
      setDraft("");
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send message";
      if (isAuthError(message)) {
        setSessionExpired(true);
        setAuth(null);
        return;
      }
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl flex-col px-6 py-10">
      <div className="mb-6">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inbox
        </Link>
      </div>

      {!isReady || isLoading ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm text-slate-500">Loading conversation...</p>
        </div>
      ) : !user || !token ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-brand-text">
            {sessionExpired ? "Session expired" : "Sign in to view messages"}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {sessionExpired
              ? "Your saved session is no longer valid. Log in again to open this conversation."
              : "Your chat history is available after login."}
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-10 text-sm text-rose-700 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          {error}
        </div>
      ) : !conversation ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm text-slate-500">Conversation not found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[30px] border border-brand-border bg-white/95 shadow-[0_24px_90px_rgba(15,23,42,0.1)]">
          <div className="flex items-center gap-4 border-b border-brand-border bg-slate-50/90 px-6 py-5">
            <Avatar
              src={conversation.other_user_avatar_url}
              alt={conversation.other_user_name}
              initial={conversation.other_user_name.charAt(0)}
              className="h-14 w-14 rounded-2xl"
            />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-brand-text">{conversation.other_user_name}</p>
              <p className="text-sm text-slate-500">
                {subtitle || (conversation.other_user_role === "scout" ? "Scout / Club" : "Player")}
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,#F8FBF9_0%,#F4F7F2_100%)] px-6 py-6">
            {conversation.messages.length > 0 ? conversation.messages.map((message) => {
              const isMine = message.sender_user_id === user.id;
              return (
                <div key={message.id} className="flex justify-start">
                  <div
                    className={`max-w-[80%] rounded-[24px] border px-4 py-3 shadow-sm ${
                      isMine
                        ? "border-emerald-300 bg-emerald-500 text-white"
                        : "border-brand-border bg-white text-brand-text"
                    }`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                      {message.sender_name}
                    </p>
                    <p className={`mt-2 text-sm leading-6 ${isMine ? "text-white" : "text-slate-700"}`}>{message.content}</p>
                    <p className={`mt-3 text-[11px] ${isMine ? "text-emerald-100/90" : "text-slate-400"}`}>
                      {formatMessageTimestamp(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-[24px] border border-dashed border-brand-border bg-white/70 p-5 text-sm text-slate-500">
                No messages yet. Start the conversation below.
              </div>
            )}
          </div>

          <div className="border-t border-brand-border bg-white px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Textarea
                className="min-h-[84px] flex-1"
                placeholder={`Message ${conversation.other_user_name}...`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                className="gap-2"
                disabled={!draft.trim() || isSending}
                onClick={() => void handleSendMessage()}
              >
                <SendHorizontal className="h-4 w-4" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>
      )}
    </main>
  );
}
