"use client"

import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        backgroundColor: "#0f172a",
        gap: "1.5rem",
        userSelect: "none",
      }}
    >
      <p
        style={{
          fontSize: "6rem",
          fontWeight: 700,
          color: "#1e293b",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          margin: 0,
        }}
      >
        404
      </p>
      <p
        style={{
          fontSize: "1.125rem",
          color: "#64748b",
          margin: 0,
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "0.5rem",
          padding: "0.625rem 1.5rem",
          borderRadius: "0.5rem",
          border: "none",
          backgroundColor: "#334155",
          color: "#ffffff",
          fontSize: "0.875rem",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#475569")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#334155")
        }
      >
        Go home
      </button>
    </div>
  )
}
