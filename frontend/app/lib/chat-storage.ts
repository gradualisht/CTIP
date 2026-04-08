import type { ChatMessage, ChatRecord } from "./chat-types"

const STORAGE_KEY = "ctip.chat-sessions"
const listeners = new Set<() => void>()
const EMPTY_CHATS: ChatRecord[] = []
let cachedChats: ChatRecord[] | null = null

function createChatId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createChatTitle(message: string) {
  const compactMessage = message.trim().replace(/\s+/g, " ")

  if (compactMessage.length <= 32) {
    return compactMessage || "New chat"
  }

  return `${compactMessage.slice(0, 29)}...`
}

function sortChats(chats: ChatRecord[]) {
  return [...chats].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  )
}

function readChats() {
  if (cachedChats) {
    return cachedChats
  }

  if (typeof window === "undefined") {
    cachedChats = EMPTY_CHATS
    return cachedChats
  }

  try {
    const rawChats = window.localStorage.getItem(STORAGE_KEY)

    if (!rawChats) {
      cachedChats = EMPTY_CHATS
      return cachedChats
    }

    const parsedChats = JSON.parse(rawChats) as ChatRecord[]
    cachedChats = Array.isArray(parsedChats)
      ? sortChats(parsedChats)
      : EMPTY_CHATS
    return cachedChats
  } catch {
    cachedChats = EMPTY_CHATS
    return cachedChats
  }
}

function writeChats(chats: ChatRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  cachedChats = sortChats(chats)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedChats))
  listeners.forEach((listener) => listener())
}

export function subscribeToChats(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function listChats() {
  return readChats()
}

export function getChat(chatId: string) {
  return readChats().find((chat) => chat.id === chatId) ?? null
}

export function upsertChat(chat: ChatRecord) {
  const remainingChats = readChats().filter(
    (existingChat) => existingChat.id !== chat.id
  )
  const nextChats = sortChats([chat, ...remainingChats])

  writeChats(nextChats)
  return chat
}

export function createChatFromConversation({
  message,
  model,
  response,
}: {
  message: string
  model: string
  response: string
}) {
  const now = new Date().toISOString()
  const chat: ChatRecord = {
    id: createChatId(),
    title: createChatTitle(message),
    model,
    messages: [
      { id: Date.now(), role: "user", content: message },
      { id: Date.now() + 1, role: "assistant", content: response },
    ],
    createdAt: now,
    updatedAt: now,
  }

  writeChats([chat, ...readChats()])
  return chat
}

export function appendConversationToChat({
  chatId,
  userMessage,
  assistantMessage,
  model,
}: {
  chatId?: string
  userMessage: ChatMessage
  assistantMessage: ChatMessage
  model: string
}) {
  const existingChat = chatId ? getChat(chatId) : null
  const now = new Date().toISOString()

  const chat: ChatRecord = {
    id: existingChat?.id ?? chatId ?? createChatId(),
    title: createChatTitle(existingChat?.title || userMessage.content),
    model,
    messages: existingChat
      ? [...existingChat.messages, userMessage, assistantMessage]
      : [userMessage, assistantMessage],
    createdAt: existingChat?.createdAt ?? now,
    updatedAt: now,
  }

  upsertChat(chat)
  return chat
}

export function saveChatState({
  chatId,
  messages,
  model,
  title,
}: {
  chatId: string
  messages: ChatMessage[]
  model: string
  title?: string
}) {
  const existingChat = getChat(chatId)
  const now = new Date().toISOString()
  const resolvedTitle =
    title ||
    existingChat?.title ||
    messages.find((message) => message.role === "user")?.content ||
    "New chat"

  const chat: ChatRecord = {
    id: chatId,
    title: createChatTitle(resolvedTitle),
    model,
    messages,
    createdAt: existingChat?.createdAt ?? now,
    updatedAt: now,
  }

  upsertChat(chat)
  return chat
}
