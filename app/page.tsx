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
          style={{ color: "#865596" }}
        >
          Pact
        </span>
        <span
          className="inline-block rounded-full ml-0.5"
          style={{
            background: "linear-gradient(135deg, #EF7043, #D2582F)",
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

type FormState = "default" | "loading" | "error"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formState, setFormState] = useState<FormState>("default")
  const [errorMessage, setErrorMessage] = useState("")

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
      setErrorMessage(
        "This email domain is not registered on Pact. Contact your Counselect account manager to get access."
      )
      setFormState("error")
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

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
      style={{ backgroundColor: "#E5E5EA" }}
    >
      {/* Hero text above the card */}
      <div className="text-center mb-8">
        <h1
          className="font-semibold mb-2"
          style={{
            color: "#865596",
            fontSize: "clamp(28px, 5vw, 36px)",
            letterSpacing: "-0.01em"
          }}
        >
          Every deal starts here.
        </h1>
        <p
          className="font-normal"
          style={{ color: "#4A4A6A", fontSize: "15px" }}
        >
          Trusted counsel, from the very first signature.
        </p>
      </div>

      {/* Login card */}
      <div
        className="w-full max-w-[380px] px-8 py-10"
        style={{
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #E5E5EA",
          borderRadius: "10px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)"
        }}
      >
        <div className="flex justify-center mb-6">
          <PactWordmark />
        </div>

        {/* Divider */}
        <div
          className="mb-6"
          style={{ height: "0.5px", backgroundColor: "#E5E5EA" }}
        />

        <h2
          className="font-medium text-center mb-1"
          style={{ color: "#865596", fontSize: "16px" }}
        >
          Sign in to Pact
        </h2>
        <p
          className="text-center mb-6"
          style={{ color: "#4A4A6A", fontSize: "13px" }}
        >
          Enter your work email and password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
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
                border: "0.5px solid #E5E5EA",
                borderRadius: "6px",
                color: "#431F5D"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#EF7043"
                e.target.style.boxShadow = "0 0 0 2px rgba(239, 112, 67, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E5EA"
                e.target.style.boxShadow = "none"
              }}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (formState === "error") setFormState("default")
              }}
              placeholder="Password"
              required
              disabled={formState === "loading"}
              className="w-full px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: "#F7F8FA",
                border: "0.5px solid #E5E5EA",
                borderRadius: "6px",
                color: "#431F5D"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#EF7043"
                e.target.style.boxShadow = "0 0 0 2px rgba(239, 112, 67, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E5EA"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>

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
            className="w-full py-3 font-medium mt-4 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #EF7043, #D2582F)",
              color: "#FFFFFF",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            {formState === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p
          className="text-center mt-5"
          style={{ color: "#9B9B9B", fontSize: "11px" }}
        >
          Access is by invitation only. Contact your Counselect account manager if you need access.
        </p>
      </div>
    </main>
  )
}
