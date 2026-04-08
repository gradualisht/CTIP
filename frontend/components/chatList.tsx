"use client"

import { useSyncExternalStore } from "react"
import { useRouter, usePathname } from "next/navigation"
import { listChats, subscribeToChats } from "@/app/lib/chat-storage"

const EMPTY_CHATS = [] as const

export default function ChatList() {
  const router = useRouter()
  const pathname = usePathname()
  const chats = useSyncExternalStore(
    subscribeToChats,
    listChats,
    () => EMPTY_CHATS
  )

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
