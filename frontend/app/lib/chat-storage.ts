import type { ChatMessage, ChatRecord } from "./chat-types"
import type { ApiChat, ApiChatSummary } from "./api"

// null  → not yet loaded (show skeletons)
// []    → loaded, no chats yet
// [...] → loaded with data
let cachedChats: ChatRecord[] | null = null

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function sortByUpdated(chats: ChatRecord[]) {
  return [...chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

// ── mappers ───────────────────────────────────────────────────────────────────

export function mapApiChatSummary(c: ApiChatSummary): ChatRecord {
  return {
    id: c.id,
    title: c.title,
    model: c.model,
    messages: [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }
}

export function mapApiChat(c: ApiChat): ChatRecord {
  return {
    id: c.id,
    title: c.title,
    model: c.model,
    messages: c.messages.map(
      (m): ChatMessage => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })
    ),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }
}

// ── store API ─────────────────────────────────────────────────────────────────

export function subscribeToChats(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Returns null when chats haven't been fetched yet (show skeletons). */
export function listChats(): ChatRecord[] | null {
  return cachedChats
}

export function getChat(chatId: string): ChatRecord | null {
  return cachedChats?.find((c) => c.id === chatId) ?? null
}

export function setChats(chats: ChatRecord[]) {
  cachedChats = sortByUpdated(chats)
  notify()
}

export function optimisticallyAddOrUpdateChat(chat: ChatRecord) {
  const others = (cachedChats ?? []).filter((c) => c.id !== chat.id)
  cachedChats = sortByUpdated([chat, ...others])
  notify()
}

export function optimisticallyRemoveChat(chatId: string) {
  if (!cachedChats) return
  cachedChats = cachedChats.filter((c) => c.id !== chatId)
  notify()
}
