"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleMore } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { apiGetConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ConversationPreview } from "@/lib/types";

function formatTimestamp(value: string) {
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

export function ChatInboxShell() {
  const { isReady, token, user, setAuth } = useAuth();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    apiGetConversations(token)
      .then((result) => {
        setConversations(result);
        setError(null);
        setSessionExpired(false);
      })
      .catch((loadError) => {
        const message = loadError instanceof Error ? loadError.message : "Failed to load conversations";
        if (isAuthError(message)) {
          setSessionExpired(true);
          setAuth(null);
          setError(null);
          return;
        }
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [isReady, token, user, setAuth]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Chat</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-brand-text">Inbox</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Review your existing conversations with players and scouts, then open any thread to see the full message history.
          </p>
        </div>
      </div>

      {!isReady || isLoading ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm text-slate-500">Loading conversations...</p>
        </div>
      ) : !user || !token ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold text-brand-text">
            {sessionExpired ? "Session expired" : "Sign in to open chat"}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            {sessionExpired
              ? "Your saved session is no longer valid. Log in again to see your conversations."
              : "Chat is available for both players and scouts. Sign in first to see your existing conversations."}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-10 text-sm text-rose-700 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          {error}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-[28px] border border-brand-border bg-white/92 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MessageCircleMore className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-brand-text">No conversations yet</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            Once a player or scout starts a conversation, it will appear here with the latest message preview.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[30px] border border-brand-border bg-white/94 shadow-[0_24px_90px_rgba(15,23,42,0.1)]">
          <div className="border-b border-brand-border px-6 py-5">
            <p className="text-sm text-slate-500">{conversations.length} conversation{conversations.length === 1 ? "" : "s"}</p>
          </div>
          <div className="divide-y divide-brand-border">
            {conversations.map((conversation) => (
              <Link
                href={`/chat/${conversation.id}`}
                key={conversation.id}
                className="flex items-center gap-4 px-6 py-5 transition hover:bg-emerald-50/60"
              >
                <Avatar
                  src={conversation.other_user_avatar_url}
                  alt={conversation.other_user_name}
                  initial={conversation.other_user_name.charAt(0)}
                  className="h-14 w-14 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-brand-text">{conversation.other_user_name}</p>
                      <p className="truncate text-sm text-slate-500">
                        {[conversation.other_user_position, conversation.other_user_location].filter(Boolean).join(" • ") ||
                          (conversation.other_user_role === "scout" ? "Scout / Club" : "Player")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-400">
                      {formatTimestamp(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-600">{conversation.last_message}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
