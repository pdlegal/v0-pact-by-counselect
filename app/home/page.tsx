"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function PactWordmark({ variant = "light" }: { variant?: "light" | "dark" }) {
  const textColor = variant === "light" ? "#FFFFFF" : "#431F5D"
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: textColor }}>Pact</span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }}
      />
    </div>
  )
}

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
      <div className="flex flex-col">
        <PactWordmark variant="light" />
        <span className="text-xs font-normal mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
          by Counselect
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/pending" className="text-xs font-normal hover:underline" style={{ color: "rgba(255,255,255,0.65)" }}>
          My requests
        </Link>
        <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
          {firstName && lastName ? `${firstName} ${lastName}` : "..."} · {clientName || ""} · <Link href="/" className="hover:underline">Log out</Link>
        </span>
      </div>
    </nav>
  )
}

function HeroSection({ clientName }: { clientName: string }) {
  const buttonWidth = "220px"
  const displayName = clientName || "your company"
  return (
    <section
      className="flex-1 w-full px-6 py-16 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#431F5D" }}
    >
      <div className="flex flex-col items-center mb-4">
        <h1
          className="font-semibold text-center"
          style={{ color: "#FFFFFF", fontSize: "clamp(32px, 5vw, 42px)", letterSpacing: "-0.01em" }}
        >
          Every deal starts <span style={{ color: "#FB6A1B" }}>here</span>.
        </h1>
        <div className="mt-3 rounded-full" style={{ width: "80px", height: "3px", background: "linear-gradient(90deg, #FB6A1B, #D2582F)" }} />
      </div>

      <p className="font-normal text-center mb-10" style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", maxWidth: "340px" }}>
        Trusted counsel, from the very first signature.
      </p>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4">
        <div className="flex flex-col items-center" style={{ width: buttonWidth }}>
          <Link
            href="/generate"
            className="w-full text-center font-medium mb-3"
            style={{ backgroundColor: "#FFFFFF", color: "#431F5D", borderRadius: "6px", padding: "12px 20px", fontSize: "14px" }}
          >
            I need an NDA
          </Link>
          <span className="font-normal text-center" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", lineHeight: 1.5 }}>
            Answer five to ten questions. Receive a ready-to-send NDA.
          </span>
        </div>

        <div className="flex flex-col items-center" style={{ width: buttonWidth }}>
          <Link
            href="/review"
            className="w-full text-center font-normal mb-3"
            style={{ backgroundColor: "transparent", border: "1.5px solid rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.85)", borderRadius: "6px", padding: "12px 20px", fontSize: "14px" }}
          >
            I need an NDA reviewed
          </Link>
          <span className="font-normal text-center" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", lineHeight: 1.5 }}>
            {`Upload a counterparty NDA. Receive a reviewed version with ${displayName}'s positions applied.`}
          </span>
        </div>
      </div>

      <p className="font-normal text-center mt-10" style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>
        {`Reviewed against ${displayName}'s NDA standards`}
      </p>
    </section>
  )
}

export default function HomePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")

  useEffect(() => {
    async function loadClientData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, client_id")
        .eq("id", session.user.id)
        .single()

      if (!userData) return
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")

      const { data: clientData } = await supabase
        .from("clients")
        .select("display_name")
        .eq("id", userData.client_id)
        .single()

      if (clientData) setClientName(clientData.display_name || "")
    }

    loadClientData()
  }, [])

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#431F5D" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />
      <HeroSection clientName={clientName} />
    </main>
  )
}
