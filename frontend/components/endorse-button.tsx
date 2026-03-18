"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiEndorse } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function EndorseButton({ playerId, count }: { playerId: number; count: number }) {
  const router = useRouter();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEndorse() {
    if (!token) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await apiEndorse(token, playerId);
      setMessage("Player endorsed.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not endorse");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="justify-center gap-2" disabled={!token || submitting} onClick={handleEndorse}>
        <ThumbsUp className="h-4 w-4" />
        {submitting ? "Saving..." : `Endorse Player - ${count}`}
      </Button>
      <p className="text-sm text-slate-400">{message ?? `${count} endorsements`}</p>
    </div>
  );
}
