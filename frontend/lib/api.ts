import type {
  AuthResponse,
  ChatMessage,
  ChatSearchResult,
  ConversationDetail,
  ConversationPreview,
  FeedItem,
  PlayerCard,
  PlayerProfile,
  PostRecord
} from "@/lib/types";

const API_URL =
  (typeof window === "undefined" ? process.env.API_URL : process.env.NEXT_PUBLIC_API_URL) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network request failed");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function apiGetPlayers(): Promise<PlayerCard[]> {
  return request("/players");
}

export function apiGetFeed(): Promise<FeedItem[]> {
  return request("/feed");
}

export function apiGetConversations(token: string): Promise<ConversationPreview[]> {
  return request("/chat/conversations", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function apiCreateConversation(token: string, targetUserId: number): Promise<ConversationPreview> {
  return request("/chat/conversations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ target_user_id: targetUserId })
  });
}

export function apiGetConversation(token: string, conversationId: string): Promise<ConversationDetail> {
  return request(`/chat/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function apiSendMessage(token: string, conversationId: string, content: string): Promise<ChatMessage> {
  return request(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });
}

export function apiSearchChatUsers(token: string, query: string): Promise<ChatSearchResult[]> {
  return request(`/chat/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function apiSearchPlayers(searchParams: URLSearchParams): Promise<PlayerCard[]> {
  return request(`/search/players?${searchParams.toString()}`);
}

export function apiGetPlayer(id: string): Promise<PlayerProfile> {
  return request(`/players/${id}`);
}

export function apiRegister(payload: { email: string; password: string; role: "player" | "scout" }): Promise<AuthResponse> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function apiLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function apiCreateProfile(token: string, payload: unknown): Promise<PlayerProfile> {
  return request("/players", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function apiUpdateProfile(token: string, id: number, payload: unknown): Promise<PlayerProfile> {
  return request(`/players/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function apiUpsertStats(token: string, id: number, payload: unknown) {
  return request(`/players/${id}/stats`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function apiAddHighlight(token: string, id: number, payload: unknown) {
  return request(`/players/${id}/highlights`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function apiAddComment(token: string, id: number, content: string) {
  return request(`/players/${id}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });
}

export function apiCreatePost(token: string, payload: { title: string; content: string; highlight_video_id?: number | null }) {
  return request<PostRecord>("/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function apiEndorse(token: string, id: number) {
  return request(`/players/${id}/endorse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}
