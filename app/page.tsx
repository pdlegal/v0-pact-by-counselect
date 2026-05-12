"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline">
        <span 
          className="text-2xl font-medium"
          style={{ color: "#431F5D" }}
        >
          Pact
        </span>
        <span
          className="inline-block rounded-full ml-0.5"
          style={{
            background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
            width: "8px",
            height: "8px"
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span 
          style={{ color: "#9B9B9B", fontSize: "11px" }}
        >
          by
        </span>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_actual%20colours%404x-6LAad0QHNxezqbH0koD47Bfz5Wwjr3.png"
          alt="Counselect"
          width={70}
          height={18}
          className="object-contain"
          style={{ marginTop: "-2px" }}
          unoptimized
        />
      </div>
    </div>
  )
}

type FormState = "default" | "success" | "error"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [formState, setFormState] = useState<FormState>("default")
  const [submittedEmail, setSubmittedEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate domain validation - reject free email providers for demo
    const domain = email.split("@")[1]?.toLowerCase()
    const blockedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    const isBlocked = blockedDomains.some(blocked => domain === blocked)
    
    if (isBlocked) {
      setFormState("error")
    } else {
      setSubmittedEmail(email)
      setFormState("success")
    }
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F7F8FA" }}
    >
      <div
        className="w-full max-w-[380px] px-8 py-10"
        style={{
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #E2E4E8",
          borderRadius: "10px"
        }}
      >
        <div className="flex justify-center mb-8">
          <PactWordmark />
        </div>

        {formState === "success" ? (
          <div className="text-center">
            <h1 
              className="font-medium mb-4"
              style={{ color: "#431F5D", fontSize: "18px" }}
            >
              Check your inbox
            </h1>
            <p 
              className="leading-relaxed"
              style={{ color: "#4A4A6A", fontSize: "13px" }}
            >
              {"We've sent a login link to "}
              <span className="font-medium" style={{ color: "#431F5D" }}>
                {submittedEmail}
              </span>
              {". Check your inbox — the link expires in 15 minutes."}
            </p>
          </div>
        ) : (
          <>
            <h1 
              className="font-medium text-center mb-2"
              style={{ color: "#431F5D", fontSize: "18px" }}
            >
              Sign in to Pact
            </h1>
            <p 
              className="text-center mb-6"
              style={{ color: "#4A4A6A", fontSize: "13px" }}
            >
              {"Enter your work email and we'll send you a login link."}
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formState === "error") setFormState("default")
                }}
                placeholder="you@yourcompany.com"
                required
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: "#F7F8FA",
                  border: "0.5px solid #E2E4E8",
                  borderRadius: "6px",
                  color: "#431F5D"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FB6A1B"
                  e.target.style.boxShadow = "0 0 0 2px rgba(251, 106, 27, 0.2)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E4E8"
                  e.target.style.boxShadow = "none"
                }}
              />

              {formState === "error" && (
                <div 
                  className="px-3 py-3 mt-3 leading-relaxed"
                  style={{
                    backgroundColor: "#FFEBEE",
                    color: "#B71C1C",
                    borderRadius: "6px",
                    fontSize: "13px",
                    padding: "10px 12px"
                  }}
                >
                  This email domain is not registered on Pact. Contact your Counselect account manager to get access.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 font-medium mt-3 transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              >
                Send me a login link
              </button>
            </form>

            <p 
              className="text-center mt-4"
              style={{ color: "#9B9B9B", fontSize: "11px" }}
            >
              {"We'll send a one-click link — no password needed."}
            </p>

            <Link
              href="/home"
              className="block text-center mt-6 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "#431F5D" }}
            >
              Skip to homepage (dev)
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
