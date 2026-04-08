"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ChatInput from "@/components/chatInput"
import MessageList from "@/components/messageList"
import type { ChatMessage } from "@/app/lib/chat-types"
import { getChat } from "@/app/lib/chat-storage"

export type Message = ChatMessage

export default function Page() {
  const params = useParams<{ id: string }>()
  const chatId = params.id
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const chat = getChat(chatId)

    if (chat) {
      setMessages(chat.messages)
      setSelectedModel(chat.model)
    }
    setIsLoaded(true)
  }, [chatId])

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg])
  }

  return (
    <div className="flex h-full w-full flex-col">
      <MessageList messages={messages} />
      {isLoaded ? (
        <ChatInput
          chatId={chatId}
          initialModel={selectedModel}
          onSend={addMessage}
        />
      ) : null}
    </div>
  )
}
