import { Textarea } from "@/components/ui/textarea"
import { ChevronUp } from "lucide-react"

const styles = `
  .chat-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    align-items: center;
    justify-content: center;
    background-color: #0f172a;
  }

  .chat-input-wrapper {
    width: 100%;
    max-width: 48rem;
    display: flex;
    align-items: center;
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
  }

  .chat-input:focus {
    outline: none;
    box-shadow: none;
  }

  .chat-input::placeholder {
    color: #64748b;
  }

  .chat-button {
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
    font-size: 1.25rem;
  }

  .chat-button:hover {
    background-color: #475569;
  }
`

export default function Chat() {
  return (
    <>
      <style>{styles}</style>
      <div className="chat-container">
        <div className="chat-input-wrapper">
          <Textarea placeholder="Send a message" className="chat-input" />
          <button className="chat-button">
            <ChevronUp />
          </button>
        </div>
      </div>
    </>
  )
}
