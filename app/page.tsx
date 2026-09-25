"use client"

import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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
        <span style={{ color: "#9B9B9B", fontSize: "11px" }}>by</span>
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

type FormState = "default" | "loading" | "code_sent" | "verifying" | "error"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [formState, setFormState] = useState<FormState>("default")
  const [errorMessage, setErrorMessage] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("loading")

    const domain = email.split("@")[1]?.toLowerCase()

    // Check domain against Supabase client_domains table
    const { data: domainRecord, error: domainError } = await supabase
      .from("client_domains")
      .select("client_id")
      .eq("domain", domain)
      .eq("active", true)
      .single()

    if (domainError || !domainRecord) {
      setErrorMessage(
        "This email domain is not registered on Pact. Contact your Counselect account manager to get access."
      )
      setFormState("error")
      return
    }

    // Send OTP code
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    })

    if (otpError) {
      setErrorMessage("Something went wrong sending your code. Please try again.")
      setFormState("error")
      return
    }

    setFormState("code_sent")
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("verifying")

    const token = code.join("")

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    })

    if (error || !data.session) {
      setErrorMessage("That code didn't work. Check the code and try again, or go back and request a new one.")
      setFormState("code_sent")
      return
    }

    const userEmail = data.session.user.email!

    // Check if user exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("email", userEmail)
      .single()

    if (!existingUser) {
      // New user — look up client from domain
      const domain = userEmail.split("@")[1]

      const { data: domainRecord } = await supabase
        .from("client_domains")
        .select("client_id")
        .eq("domain", domain)
        .eq("active", true)
        .single()

      if (domainRecord) {
        await supabase.from("users").insert({
          email: userEmail,
          client_id: domainRecord.client_id
        })
      }

      router.push("/first-login")
      return
    }

    if (!existingUser.first_name) {
      router.push("/first-login")
      return
    }

    router.push("/home")
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-advance to next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = [...code]
    pasted.split("").forEach((char, i) => {
      newCode[i] = char
    })
    setCode(newCode)
    // Focus last filled box
    const lastIndex = Math.min(pasted.length, 5)
    document.getElementById(`code-${lastIndex}`)?.focus()
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

        {/* Email entry screen */}
        {(formState === "default" || formState === "loading" || formState === "error") && (
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
              {"Enter your work email and we'll send you a 6-digit code."}
            </p>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formState === "error") setFormState("default")
                }}
                placeholder="you@yourcompany.com"
                required
                disabled={formState === "loading"}
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
                  className="mt-3 leading-relaxed"
                  style={{
                    backgroundColor: "#FFEBEE",
                    color: "#B71C1C",
                    borderRadius: "6px",
                    fontSize: "13px",
                    padding: "10px 12px"
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === "loading"}
                className="w-full py-3 font-medium mt-3 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              >
                {formState === "loading" ? "Checking..." : "Send me a code"}
              </button>
            </form>

            <p
              className="text-center mt-4"
              style={{ color: "#9B9B9B", fontSize: "11px" }}
            >
              {"We'll send a 6-digit code — no password needed."}
            </p>
          </>
        )}

        {/* Code entry screen */}
        {(formState === "code_sent" || formState === "verifying") && (
          <>
            <h1
              className="font-medium text-center mb-2"
              style={{ color: "#431F5D", fontSize: "18px" }}
            >
              Check your inbox
            </h1>
            <p
              className="text-center mb-6"
              style={{ color: "#4A4A6A", fontSize: "13px", lineHeight: 1.6 }}
            >
              {"We sent a 6-digit code to "}
              <span className="font-medium" style={{ color: "#431F5D" }}>
                {email}
              </span>
              {". Enter it below to sign in."}
            </p>

            <form onSubmit={handleCodeSubmit}>
              {/* 6-digit code boxes */}
              <div className="flex gap-2 justify-center mb-4" onPaste={handleCodePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="outline-none text-center font-medium transition-all"
                    style={{
                      width: "44px",
                      height: "52px",
                      backgroundColor: "#F7F8FA",
                      border: "0.5px solid #E2E4E8",
                      borderRadius: "6px",
                      color: "#431F5D",
                      fontSize: "20px"
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
                ))}
              </div>

              {errorMessage && formState === "code_sent" && (
                <div
                  className="mb-3 leading-relaxed"
                  style={{
                    backgroundColor: "#FFEBEE",
                    color: "#B71C1C",
                    borderRadius: "6px",
                    fontSize: "13px",
                    padding: "10px 12px"
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === "verifying" || code.some(d => d === "")}
                className="w-full py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              >
                {formState === "verifying" ? "Verifying..." : "Sign in"}
              </button>
            </form>

            <button
              onClick={() => {
                setFormState("default")
                setCode(["", "", "", "", "", ""])
                setErrorMessage("")
              }}
              className="w-full text-center mt-4 transition-opacity hover:opacity-70"
              style={{ color: "#9B9B9B", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}
            >
              ← Use a different email
            </button>
          </>
        )}
      </div>
    </main>
  )
}
