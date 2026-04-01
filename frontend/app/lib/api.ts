const BASE_URL = "http://localhost:8000";

export async function sendMessage(message: string, model: string) {
  const res = await fetch(`${BASE_URL}/send_message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model }),
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}