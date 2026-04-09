"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  listChats,
  subscribeToChats,
  setChats,
  mapApiChatSummary,
} from "@/app/lib/chat-storage"
import { listChatsApi } from "@/app/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatList() {
  const router = useRouter()
  const pathname = usePathname()
  const chats = useSyncExternalStore(subscribeToChats, listChats, () => null)

  useEffect(() => {
    // Only fetch if not already loaded
    if (listChats() === null) {
      listChatsApi()
        .then((data) => setChats(data.map(mapApiChatSummary)))
        .catch(() => setChats([]))
    }
  }, [])

  if (chats === null) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </>
    )
  }

  if (chats.length === 0) {
    return <p className="px-2 text-xs text-slate-500">No chats yet</p>
  }

  return (
    <>
      {chats.map((chat) => {
        const isActive = pathname === `/chat/${chat.id}`

        return (
          <button
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            {chat.title}
          </button>
        )
      })}
    </>
  )
}
