"use client"

import { useRouter } from "next/navigation"
import Chat from "@/components/chatInput"

export default function Hero() {
  const router = useRouter()

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
      }}
    >
      <Chat
        onSend={() => {}}
        onConversationComplete={({ chatId }) => {
          router.push(`/chat/${chatId}`)
        }}
      />
    </div>
  )
}
