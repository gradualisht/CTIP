'use client'
import ChatList from "./chatList"
import { Home, Plus, Settings } from "lucide-react"
import { useRouter } from 'next/navigation'

const styles = `
  .nav-bar {
    display: flex;
    flex-direction: column;
    width: 16rem;
    height: 100vh;
    background-color: #0f172a;
    border-right: 1px solid #334155;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  .nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid #334155;
  }

  .nav-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .nav-new-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    background-color: #334155;
    border: none;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-new-chat:hover {
    background-color: #475569;
  }

  .nav-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.75rem;
    border-radius: 0.375rem;
    background-color: transparent;
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 0.875rem;
  }

  .nav-item:hover {
    background-color: #1e293b;
    color: #ffffff;
  }

  .nav-item.active {
    background-color: #334155;
    color: #3b82f6;
  }

  .nav-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #334155;
  }

  .nav-footer-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    background-color: transparent;
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .nav-footer-item:hover {
    background-color: #1e293b;
    color: #ffffff;
  }
`

export default function NavBar() {
  const router = useRouter()
  return (
    <>
      <style>{styles}</style>
      <div className="nav-bar">
        <div className="nav-header">
          <button onClick={() => router.push('/')}>
            <h1>CTIP</h1>
          </button>
          <button className="nav-new-chat">
            <Plus size={18} />
          </button>
        </div>

        <div className="nav-content">
          <div className="nav-section">
            <button className="nav-item active">
              <Home size={18} />
              <span>Home</span>
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Recent Chats</div>
            <ChatList />
          </div>
        </div>

        <div className="nav-footer">
          <button className="nav-footer-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  )
}
