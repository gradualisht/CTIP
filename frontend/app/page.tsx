import { Button } from "@/components/ui/button"
import Chat from "@/components/chat.tsx"
import ChatList from "@/components/navBar"

export default function Page() {
  return (
    <div className="flex h-full w-full">
      <ChatList />
      <Chat />
    </div>
  )
}
