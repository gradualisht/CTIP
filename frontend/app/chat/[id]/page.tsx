'use client'

import { useState } from "react"
import ChatInput from "@/components/chatInput"
import MessageList from "@/components/messageList"

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg])
  }

  return (
    <div className="flex flex-col h-full w-full">
      <MessageList messages={messages} />
      <ChatInput onSend={addMessage} />
    </div>
  )
}