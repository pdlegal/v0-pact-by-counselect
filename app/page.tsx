"use client"

import { useState } from "react"
import Image from "next/image"

function PactWordmark() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <span 
          className="text-2xl font-medium"
          style={{ color: "#0D1F3C" }}
        >
          Pact
        </span>
        <span
          className="ml-0.5 inline-block rounded-full"
          style={{
            backgroundColor: "#00897B",
            width: "5px",
            height: "5px",
            marginBottom: "8px"
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span 
          className="text-xs"
          style={{ color: "#4A4A6A" }}
        >
          by
        </span>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_actual%20colours%404x-6LAad0QHNxezqbH0koD47Bfz5Wwjr3.png"
          alt="Counselect"
          width={70}
          height={18}
          className="object-contain"
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
              className="text-xl font-medium mb-4"
              style={{ color: "#0D1F3C" }}
            >
              Check your inbox
            </h1>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: "#4A4A6A" }}
            >
              {"We've sent a login link to "}
              <span className="font-medium" style={{ color: "#0D1F3C" }}>
                {submittedEmail}
              </span>
              {". Check your inbox — it expires in 15 minutes."}
            </p>
          </div>
        ) : (
          <>
            <h1 
              className="text-xl font-medium text-center mb-2"
              style={{ color: "#0D1F3C" }}
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
                className="w-full px-4 py-3 text-sm rounded-lg mb-3 outline-none transition-all"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E4E8",
                  color: "#0D1F3C"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00897B"
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 137, 123, 0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E4E8"
                  e.target.style.boxShadow = "none"
                }}
              />

              {formState === "error" && (
                <div 
                  className="px-3 py-3 rounded-lg mb-3 text-sm leading-relaxed"
                  style={{
                    backgroundColor: "#FFEBEE",
                    color: "#B71C1C"
                  }}
                >
                  This email domain is not registered on Pact. Contact your Counselect account manager to get access.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#00897B",
                  color: "#FFFFFF"
                }}
              >
                Send me a login link
              </button>
            </form>

            <p 
              className="text-center mt-4"
              style={{ color: "#4A4A6A", fontSize: "11px" }}
            >
              {"We'll send a one-click link — no password needed."}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
