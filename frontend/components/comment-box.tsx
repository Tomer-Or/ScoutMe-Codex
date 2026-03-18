"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiAddComment } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function CommentBox({ playerId }: { playerId: number }) {
  const router = useRouter();
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitComment() {
    if (!token || !content.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await apiAddComment(token, playerId, content);
      setContent("");
      setMessage("Comment added.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea placeholder="Write a comment..." value={content} onChange={(event) => setContent(event.target.value)} />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{message ?? "Share scouting notes, character feedback, or context from matches."}</p>
        <Button disabled={!token || submitting} onClick={submitComment}>
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}
