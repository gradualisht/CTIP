"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ChevronUp, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const styles = `
  .chat-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    align-items: center;
    justify-content: center;
    background-color: #0f172a;
  }

  .chat-wrapper {
    width: 100%;
    max-width: 48rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chat-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    background-color: #1e293b;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .chat-input {
    flex: 1;
    border: none;
    background: transparent;
    color: #ffffff;
    font-size: 1rem;
    outline: none;
    resize: none;
  }

  .chat-input:focus {
    outline: none;
    box-shadow: none;
  }

  .chat-input::placeholder {
    color: #64748b;
  }

  .chat-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .chat-send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: #334155;
    border: none;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .chat-send-button:hover {
    background-color: #475569;
  }

  .chat-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-model-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #334155;
    border: none;
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    outline: none;
  }

  .chat-model-selector:hover {
    background-color: #475569;
  }

  .chat-model-selector:focus {
    outline: none;
  }

  .chat-model-selector[data-state="open"] {
    background-color: #334155;
  }
`

export default function Chat() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("None")
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([])

  const models = ["None", "llama3", "Sonnet 4.6"]

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: message }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, model: selectedModel }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }])
        setMessage("")
      } else {
        console.error("Failed to send message:", response.statusText)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="chat-container">
        <div className="chat-wrapper">
          <div className="chat-input-wrapper">
            <Textarea
              placeholder="Send a message"
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          <div className="chat-actions">
            <button
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
            >
              <ChevronUp size={20} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="chat-model-selector">
                  {selectedModel}
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-md border-[#334155] bg-[#1e293b]">
                <DropdownMenuGroup>
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className="cursor-pointer text-[#cbd5e1] hover:bg-[#334155] hover:text-white"
                    >
                      {model}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}
