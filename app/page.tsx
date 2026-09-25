"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function PactWordmark() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline">
        <span className="text-3xl font-medium" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
          Pact
        </span>
        <span
          className="inline-block rounded-full ml-1"
          style={{ background: "#EF7043", width: "9px", height: "9px", marginBottom: "3px" }}
        />
      </div>
      <span className="mt-1.5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
        by Counselect
      </span>
    </div>
  )
}

type FormState = "default" | "loading" | "error"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formState, setFormState] = useState<FormState>("default")
  const [errorMessage, setErrorMessage] = useState("")

  const prefixRef = useRef<HTMLSpanElement>(null)
  const hereRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const underlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefixStr = "Every deal starts "
    const hereStr = "here"
    let pi = 0
    let hi = 0
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout

    function typePrefix() {
      if (!prefixRef.current) return
      if (pi < prefixStr.length) {
        prefixRef.current.textContent += prefixStr[pi]
        pi++
        t1 = setTimeout(typePrefix, 70)
      } else {
        t2 = setTimeout(typeHere, 80)
      }
    }

    function typeHere() {
      if (!hereRef.current) return
      if (hi < hereStr.length) {
        hereRef.current.textContent += hereStr[hi]
        hi++
        t2 = setTimeout(typeHere, 90)
      } else {
        t3 = setTimeout(showUnderlineAndDot, 80)
      }
    }

    function showUnderlineAndDot() {
      if (underlineRef.current) {
        underlineRef.current.style.transition = "width 0.5s ease"
        underlineRef.current.style.width = "100%"
      }
      setTimeout(() => {
        if (dotRef.current) dotRef.current.style.opacity = "1"
      }, 520)
    }

    const startTimer = setTimeout(typePrefix, 1400)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("loading")

    const domain = email.split("@")[1]?.toLowerCase()

    const { data: domainRecord, error: domainError } = await supabase
      .from("client_domains")
      .select("client_id")
      .eq("domain", domain)
      .eq("active", true)
      .single()

    if (domainError || !domainRecord) {
      setErrorMessage("This email domain is not registered on Pact. Contact your Counselect account manager to get access.")
      setFormState("error")
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.session) {
      setErrorMessage("Incorrect email or password. Please try again.")
      setFormState("error")
      return
    }

    const userEmail = data.session.user.email!
    const userId = data.session.user.id

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("id", userId)
      .single()

    if (!existingUser) {
      const domain = userEmail.split("@")[1]
      const { data: domainRecord } = await supabase
        .from("client_domains")
        .select("client_id")
        .eq("domain", domain)
        .eq("active", true)
        .single()

      if (domainRecord) {
        await supabase.from("users").insert({
          id: userId,
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

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#431F5D" }}
    >
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
        .stage-1 { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .stage-3 { animation: fadeUp 0.6s ease forwards 0.3s; opacity: 0; }
        .stage-4 { animation: fadeUp 0.6s ease forwards 0.45s; opacity: 0; }
        .headline-wrap { opacity: 0; animation: fadeIn 0.01s forwards 1.2s; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .cursor { animation: blink 0.75s step-end infinite; }
      `}</style>

      {/* Wordmark */}
      <div className="stage-1 flex flex-col items-center mb-10">
        <PactWordmark />
      </div>

      {/* Animated headline */}
      <div className="headline-wrap mb-10 text-center">
        <div className="flex items-end justify-center whitespace-nowrap" style={{ lineHeight: 1 }}>
          <span
            ref={prefixRef}
            style={{ fontSize: "34px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em" }}
          />
          <span
            ref={hereRef}
            style={{ fontSize: "34px", fontWeight: 600, color: "#EF7043", letterSpacing: "-0.02em" }}
          />
          <span
            ref={dotRef}
            style={{ fontSize: "34px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em", opacity: 0 }}
          >
            .
          </span>
          <span
            ref={cursorRef}
            className="cursor"
            style={{
              display: "inline-block",
              width: "2px",
              height: "34px",
              background: "rgba(255,255,255,0.75)",
              verticalAlign: "middle",
              marginLeft: "2px"
            }}
          />
        </div>
        {/* Full sentence underline */}
        <div style={{ position: "relative", height: "3px", marginTop: "6px" }}>
          <div
            ref={underlineRef}
            style={{
              position: "absolute",
              left: 0,
              height: "3px",
              background: "#EF7043",
              borderRadius: "2px",
              width: 0
            }}
          />
        </div>
      </div>

      {/* Form card */}
      <div
        className="stage-3 w-full"
        style={{
          maxWidth: "340px",
          background: "rgba(255,255,255,0.07)",
          borderRadius: "14px",
          border: "0.5px solid rgba(255,255,255,0.15)",
          padding: "32px 36px"
        }}
      >
        <p
          className="text-center mb-5"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase" }}
        >
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (formState === "error") setFormState("default") }}
              placeholder="you@yourcompany.com"
              required
              disabled={formState === "loading"}
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "14px"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#EF7043"; e.target.style.boxShadow = "0 0 0 2px rgba(239,112,67,0.25)" }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.boxShadow = "none" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (formState === "error") setFormState("default") }}
              placeholder="Password"
              required
              disabled={formState === "loading"}
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "14px"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#EF7043"; e.target.style.boxShadow = "0 0 0 2px rgba(239,112,67,0.25)" }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.boxShadow = "none" }}
            />
          </div>

          {formState === "error" && (
            <div
              className="mt-3 leading-relaxed"
              style={{
                background: "rgba(183,28,28,0.3)",
                border: "0.5px solid rgba(183,28,28,0.5)",
                color: "#FFCDD2",
                borderRadius: "8px",
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
            className="w-full py-3 font-medium mt-5 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: "#EF7043",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "14px"
            }}
          >
            {formState === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p
        className="stage-4 text-center mt-5"
        style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", maxWidth: "280px", lineHeight: 1.7 }}
      >
        Access is by invitation only. Contact your Counselect account manager if you need access.
      </p>
    </main>
  )
}
