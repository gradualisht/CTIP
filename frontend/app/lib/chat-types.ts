export type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

export type ChatRecord = {
  id: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}
