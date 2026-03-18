"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiCreateConversation } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function StartChatButton({
  targetUserId,
  label = "Message Player",
  variant = "secondary",
  disabled = false
}: {
  targetUserId: number;
  label?: string;
  variant?: "default" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isOwnProfile = user?.id === targetUserId;

  async function handleStartChat() {
    if (!token || !user || disabled || isOwnProfile) return;
    setSubmitting(true);
    try {
      const conversation = await apiCreateConversation(token, targetUserId);
      router.push(`/chat/${conversation.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      variant={variant}
      disabled={!token || !user || disabled || isOwnProfile || submitting}
      onClick={() => void handleStartChat()}
      className="justify-center gap-2"
      title={!token ? "Log in to start chatting" : isOwnProfile ? "You cannot chat with yourself" : undefined}
    >
      <MessageCircleMore className="h-4 w-4" />
      {submitting ? "Opening..." : label}
    </Button>
  );
}
