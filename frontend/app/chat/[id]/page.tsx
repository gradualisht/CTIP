"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  const router = useRouter()
  const chatId = params.id
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [chatNotFound, setChatNotFound] = useState(false)

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
      .catch((err: Error) => {
        if (err.message.includes("404") || err.message.includes("not found")) {
          setChatNotFound(true)
        }
      })
      .finally(() => setIsLoaded(true))
  }, [chatId])

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg])
  }

  if (chatNotFound) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          backgroundColor: "#0f172a",
          gap: "1.5rem",
          userSelect: "none",
        }}
      >
        <p
          style={{
            fontSize: "6rem",
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1,
            letterSpacing: "-0.05em",
            margin: 0,
          }}
        >
          404
        </p>
        <p style={{ fontSize: "1.125rem", color: "#64748b", margin: 0 }}>
          This chat doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#334155",
            color: "#ffffff",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#475569")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#334155")
          }
        >
          Go home
        </button>
      </div>
    )
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
