const BASE_URL = "http://localhost:8000"

// ── types ─────────────────────────────────────────────────────────────────────

export type ApiMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

export type ApiChatSummary = {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export type ApiChat = ApiChatSummary & {
  messages: ApiMessage[]
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── chat endpoints ────────────────────────────────────────────────────────────

export function listChatsApi(): Promise<ApiChatSummary[]> {
  return apiFetch(`${BASE_URL}/chats`)
}

export function getChatApi(chatId: string): Promise<ApiChat> {
  return apiFetch(`${BASE_URL}/chats/${chatId}`)
}

export function createChatApi(
  message: string,
  model: string
): Promise<ApiChat> {
  return apiFetch(`${BASE_URL}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model }),
  })
}

export function appendMessageApi(
  chatId: string,
  message: string,
  model: string
): Promise<{
  user_message: ApiMessage
  assistant_message: ApiMessage
  updated_at: string
}> {
  return apiFetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model }),
  })
}

export function deleteChatApi(chatId: string): Promise<void> {
  return apiFetch(`${BASE_URL}/chats/${chatId}`, { method: "DELETE" })
}

// ── legacy (kept for backward compat) ────────────────────────────────────────

export async function sendMessage(message: string, model: string) {
  return apiFetch<{ message: string; model: string; response: string }>(
    `${BASE_URL}/send_message`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model }),
    }
  )
}
