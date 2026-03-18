import { ChatThreadShell } from "@/components/chat-thread-shell";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  return <ChatThreadShell conversationId={params.id} />;
}
