"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ChatInput from "@/components/chatInput"
import MessageList from "@/components/messageList"
import type { ChatMessage } from "@/app/lib/chat-types"
import {
  getChat,
  optimisticallyAddOrUpdateChat,
  mapApiChat,
} from "@/app/lib/chat-storage"
import { getChatApi } from "@/app/lib/api"

export type Message = ChatMessage

export default function Page() {
  const params = useParams<{ id: string }>()
  const chatId = params.id
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    // Check in-memory cache first (fast path — e.g. just created from hero)
    const cached = getChat(chatId)
    if (cached && cached.messages.length > 0) {
      setMessages(cached.messages)
      setSelectedModel(cached.model)
      setIsLoaded(true)
      return
    }

    // Fetch from backend
    getChatApi(chatId)
      .then((data) => {
        const record = mapApiChat(data)
        optimisticallyAddOrUpdateChat(record)
        setMessages(record.messages)
        setSelectedModel(record.model)
      })
      .catch(() => {
        // Chat not found or network error — show empty
      })
      .finally(() => setIsLoaded(true))
  }, [chatId])

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg])
  }

  return (
    <div className="flex h-full w-full flex-col">
      <MessageList
        messages={messages}
        isThinking={isThinking}
        isLoading={!isLoaded}
      />
      {isLoaded ? (
        <ChatInput
          chatId={chatId}
          initialModel={selectedModel}
          onSend={addMessage}
          onThinking={setIsThinking}
        />
      ) : null}
    </div>
  )
}
