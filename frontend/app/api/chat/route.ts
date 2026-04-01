import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Call your FastAPI backend
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        model: model,
      }),
    })

    // Check if response is valid JSON
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({ reply: data.reply }, { status: 200 })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: `Failed to process message: ${error}` },
      { status: 500 }
    )
  }
}
