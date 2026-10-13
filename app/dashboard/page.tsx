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

export default function DashboardPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientId, setClientId] = useState("")
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }

      // Get client from sessionStorage (set by client picker)
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

      // Load recent submissions for this client
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("id, counterparty_name, flow, output_state, completed_at")
        .eq("client_id", storedClientId)
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .limit(5)

      if (submissionsData) setRecentSubmissions(submissionsData)
    }
    load()
  }, [router])

  const badgeForState = (state: string) => {
    if (state === "major") return { label: "Major deviations", bg: "#FCEBEB", color: "#A32D2D" }
    if (state === "minor") return { label: "Minor deviations", bg: "#FAEEDA", color: "#854F0B" }
    if (state === "escalation") return { label: "Escalated", bg: "#FAEEDA", color: "#854F0B" }
    return { label: "Clean", bg: "#EAF3DE", color: "#3B6D11" }
  }

  const formatDate = (iso: string) => {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#431F5D" }}>

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <PactWordmark />
        <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
          {firstName && lastName ? `${firstName} ${lastName}` : "..."} · Counselect · <Link href="/" className="hover:underline">Log out</Link>
        </span>
      </nav>

      {/* Client bar */}
      <div style={{ padding: "0 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Working on</span>
          <span style={{ fontSize: "16px", fontWeight: 500, color: "#FFFFFF" }}>{clientName}</span>
        </div>
        <button
          onClick={() => router.push("/home")}
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "5px", padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-arrows-exchange" aria-hidden="true" style={{ fontSize: "12px" }} />
          Switch client
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full" style={{ maxWidth: "520px" }}>

          <p className="text-center font-normal mb-2" style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>
            Reviewed against {clientName}'s NDA standards
          </p>
          <h1 className="text-center font-medium mb-10" style={{ color: "#FFFFFF", fontSize: "28px" }}>
            What do you need to do?
          </h1>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
            <button
              onClick={() => router.push("/generate")}
              className="w-full py-4 font-medium rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", color: "#FFFFFF", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-file-plus" aria-hidden="true" style={{ fontSize: "18px", color: "#FFFFFF" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", marginBottom: "2px" }}>Generate an NDA</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>Draft from {clientName}'s standard template</div>
                </div>
              </div>
              <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }} />
            </button>

            <button
              onClick={() => router.push("/review")}
              className="w-full font-medium transition-opacity hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", color: "#FFFFFF", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-file-search" aria-hidden="true" style={{ fontSize: "18px", color: "#FFFFFF" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", marginBottom: "2px" }}>Review a counterparty NDA</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>Review clause by clause against {clientName}'s playbook</div>
                </div>
              </div>
              <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>

          {/* Recent submissions */}
          {recentSubmissions.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px 20px" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
                Recent submissions
              </p>
              {recentSubmissions.map((sub, index) => {
                const badge = badgeForState(sub.output_state)
                return (
                  <div key={sub.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: index < recentSubmissions.length - 1 ? "0.5px solid rgba(255,255,255,0.08)" : "none" }}>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 1px" }}>{sub.counterparty_name || "—"}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "capitalize" }}>
                        {sub.flow} · {formatDate(sub.completed_at)}
                      </p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "8px", background: badge.bg, color: badge.color, flexShrink: 0 }}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
