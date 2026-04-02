'use client'

import { useRouter, usePathname } from 'next/navigation'

const chats = [
  { id: 1, title: "Chat 1" },
  { id: 2, title: "Chat 2" },
  { id: 3, title: "Chat 3" },
]

export default function ChatList() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      {chats.map((chat) => {
        const isActive = pathname === `/chat/${chat.id}`

        return (
          <button
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            {chat.title}
          </button>
        )
      })}
    </>
  )
}