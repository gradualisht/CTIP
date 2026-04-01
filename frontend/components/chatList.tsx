export default function ChatList() {
  const chats = [
    { id: 1, title: "Chat 1" },
    { id: 2, title: "Chat 2" },
    { id: 3, title: "Chat 3" },
  ]

  return (
    <>
      {chats.map((chat) => (
        <button key={chat.id} className="nav-item">
          {chat.title}
        </button>
      ))}
    </>
  )
}
