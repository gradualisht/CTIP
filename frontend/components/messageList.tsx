import { Skeleton } from "@/components/ui/skeleton"
import { Message } from "@/components/chatInput"

const containerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.5rem",
  backgroundColor: "#0f172a",
}

const rowStyle = (role: "user" | "assistant"): React.CSSProperties => ({
  display: "flex",
  justifyContent: role === "user" ? "flex-end" : "flex-start",
  maxWidth: "48rem",
  width: "100%",
  margin: "0 auto",
})

const bubbleStyle = (role: "user" | "assistant"): React.CSSProperties => ({
  backgroundColor: role === "user" ? "#3b82f6" : "#1e293b",
  color: "#ffffff",
  padding: "0.75rem 1rem",
  borderRadius:
    role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
  fontSize: "0.875rem",
  maxWidth: "70%",
  lineHeight: "1.5",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
})

function MessageSkeletonBubble() {
  return (
    <div style={rowStyle("assistant")}>
      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Skeleton className="h-4 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-xl" />
      </div>
    </div>
  )
}

export default function MessageList({
  messages,
  isThinking = false,
  isLoading = false,
}: {
  messages: Message[]
  isThinking?: boolean
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div style={containerStyle}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={rowStyle(i % 2 === 0 ? "user" : "assistant")}>
            <div
              style={{
                maxWidth: "70%",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Skeleton
                className="h-4 rounded-xl"
                style={{ width: `${120 + i * 40}px` }}
              />
              {i % 2 !== 0 && <Skeleton className="h-4 w-48 rounded-xl" />}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {messages.map((msg) => (
        <div key={msg.id} style={rowStyle(msg.role)}>
          <div style={bubbleStyle(msg.role)}>{msg.content}</div>
        </div>
      ))}
      {isThinking && <MessageSkeletonBubble />}
    </div>
  )
}
