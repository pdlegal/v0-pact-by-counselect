"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>Pact</span>
      <span className="inline-block rounded-full ml-0.5" style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }} />
    </div>
  )
}

interface Submission {
  id: string
  counterparty_name: string
  flow: string
  output_state: string
  completed_at: string
}

function badgeForState(state: string) {
  if (state === "major") return { label: "Major deviations", bg: "#FCEBEB", color: "#A32D2D" }
  if (state === "minor") return { label: "Minor deviations", bg: "#FAEEDA", color: "#854F0B" }
  if (state === "escalation") return { label: "Escalated", bg: "#FAEEDA", color: "#854F0B" }
  return { label: "Clean", bg: "#EAF3DE", color: "#3B6D11" }
}

function formatDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientId, setClientId] = useState("")
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }

      const storedClientId = sessionStorage.getItem("selected_client_id")
      const storedClientName = sessionStorage.getItem("selected_client_name")

      if (!storedClientId || !storedClientName) {
        router.push("/home")
        return
      }

      setClientId(storedClientId)
      setClientName(storedClientName)

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single()

      if (userData) {
        setFirstName(userData.first_name || "")
        setLastName(userData.last_name || "")
      }

      // Only query real submissions for real clients
      if (!storedClientId.startsWith("dummy")) {
        const { data: submissionsData } = await supabase
          .from("submissions")
          .select("id, counterparty_name, flow, output_state, completed_at")
          .eq("client_id", storedClientId)
          .eq("status", "complete")
          .order("completed_at", { ascending: false })
          .limit(5)
        if (submissionsData) setRecentSubmissions(submissionsData)
      }

      setLoadingSubmissions(false)
    }
    load()
  }, [router])

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#431F5D" }}>

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <PactWordmark />
        <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
          {firstName && lastName ? `${firstName} ${lastName}` : "..."} · Counselect · <Link href="/" className="hover:underline" style={{ color: "rgba(255,255,255,0.65)" }}>Log out</Link>
        </span>
      </nav>

      {/* Client strip */}
      <div style={{ padding: "8px 24px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Working on</span>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{clientName}</span>
        </div>
        <button
          onClick={() => router.push("/home")}
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "5px", padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-arrows-exchange" aria-hidden="true" style={{ fontSize: "12px" }} />
          Switch client
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          <h1 style={{ fontSize: "38px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 8px", textAlign: "center", lineHeight: 1.15 }}>
            Every deal starts <span style={{ color: "#FB6A1B" }}>here.</span>
          </h1>

          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: "0 0 36px", textAlign: "center" }}>
            Generate a new NDA or review a counterparty draft — in minutes.
          </p>

          {/* CTAs — side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", marginBottom: "28px" }}>
            <button
              onClick={() => router.push("/generate")}
              onMouseEnter={e => (e.currentTarget.style.border = "1.5px solid #FB6A1B")}
              onMouseLeave={e => (e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.18)")}
              style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: "12px", padding: "20px 18px", cursor: "pointer", textAlign: "left", transition: "border 0.15s" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6M12 18v-6M9 15h6"/>
                </svg>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 5px" }}>Generate an NDA</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                Draft from {clientName}'s standard template, ready to send.
              </p>
            </button>
          
            <button
              onClick={() => router.push("/review")}
              onMouseEnter={e => (e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.45)")}
              onMouseLeave={e => (e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.18)")}
              style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: "12px", padding: "20px 18px", cursor: "pointer", textAlign: "left", transition: "border 0.15s" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6M10 9H8M16 13H8M16 17H8"/>
                </svg>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 5px" }}>Review a counterparty NDA</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                Clause-by-clause review against {clientName}'s playbook.
              </p>
            </button>
          </div>

          {/* Recent submissions */}
          {!loadingSubmissions && recentSubmissions.length > 0 && (
            <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px 20px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                Recent submissions — {clientName}
              </p>
              {recentSubmissions.map((sub, index) => {
                const badge = badgeForState(sub.output_state)
                return (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: index < recentSubmissions.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 1px" }}>{sub.counterparty_name || "—"}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: 0, textTransform: "capitalize" }}>
                        {sub.flow} · {formatDate(sub.completed_at)}
                      </p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "7px", background: badge.bg, color: badge.color, flexShrink: 0 }}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* No submissions yet — only show for real clients */}
          {!loadingSubmissions && recentSubmissions.length === 0 && !clientId.startsWith("dummy") && (
            <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>No submissions yet for {clientName}.</p>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
