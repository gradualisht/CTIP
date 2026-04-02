'use client'

import Chat from "@/components/chatInput"

export default function Hero() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      backgroundColor: '#0f172a',
    }}>
      <Chat onSend={() => {}} />
    </div>
  )
}