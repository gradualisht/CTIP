"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ChevronUp, ChevronDown } from "lucide-react"
import { sendMessage } from "@/app/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const styles = `
  .chat-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0f172a;
    width: 100%;        /* add this */
    padding: 1.5rem;    /* add this */
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

export default function Chat({ onSend }: { onSend: (msg: Message) => void }) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile")

  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ]

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)

    onSend({ id: Date.now(), role: 'user', content: message })

    const result = await sendMessage(message, selectedModel)

    onSend({ id: Date.now() + 1, role: 'assistant', content: result.response })

    setMessage("")
    setIsLoading(false)
  }

  const handleKeyDown = (kbevent: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (kbevent.key === "Enter" && !kbevent.shiftKey) {
      kbevent.preventDefault()
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