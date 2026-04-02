import { Message } from "@/components/chatInput"

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: '#0f172a',
      }}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '48rem',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e293b',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user'
                ? '1rem 1rem 0.25rem 1rem'
                : '1rem 1rem 1rem 0.25rem',
              fontSize: '0.875rem',
              maxWidth: '70%',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  )
}