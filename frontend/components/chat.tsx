import { Input } from "@/components/ui/input"

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
    max-width: 28rem;
  }

  .chat-input {
    border-radius: 0.5rem;
    border: 1px solid #334155;
    background-color: #1e293b;
    padding: 0.75rem 1rem;
    color: #ffffff;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .chat-input::placeholder {
    color: #94a3b8;
  }

  .chat-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

export default function Chat() {
  return (
    <>
      <style>{styles}</style>
      <div className="chat-container">
        <div className="chat-input-wrapper">
          <Input placeholder="Type a message..." className="chat-input" />
        </div>
      </div>
    </>
  )
}
