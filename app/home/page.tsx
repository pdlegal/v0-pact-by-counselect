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

const CLIENTS = [
  { id: "d1ac6aca-47e2-459c-9430-8677dcc23500", display_name: "Acme Corp", initials: "AC", jurisdiction: "England and Wales", entities: 2, color: "#EEEDFE", textColor: "#3C3489" },
  { id: "dummy-02", display_name: "Meridian Technologies", initials: "MT", jurisdiction: "United States", entities: 3, color: "#E6F1FB", textColor: "#0C447C" },
  { id: "dummy-03", display_name: "Vantage Partners", initials: "VP", jurisdiction: "Singapore", entities: 1, color: "#E1F5EE", textColor: "#085041" },
  { id: "dummy-04", display_name: "Northgate Group", initials: "NG", jurisdiction: "Germany", entities: 4, color: "#FAECE7", textColor: "#712B13" },
  { id: "dummy-05", display_name: "Castellan Logistics", initials: "CL", jurisdiction: "Netherlands", entities: 2, color: "#FAEEDA", textColor: "#633806" },
]

export default function HomePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<typeof CLIENTS[0] | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }
      const { data: userData } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", session.user.id)
        .single()
      if (userData) setFirstName(userData.first_name || "")
    }
    loadUser()
  }, [router])

  const filtered = CLIENTS.filter(c =>
    c.display_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleContinue = () => {
    if (!selected) return
    sessionStorage.setItem("selected_client_id", selected.id)
    sessionStorage.setItem("selected_client_name", selected.display_name)
    router.push("/dashboard")
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
        <PactWordmark />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          {firstName || "..."} · Counselect · <Link href="/" className="hover:underline" style={{ color: "rgba(255,255,255,0.55)" }}>Log out</Link>
        </span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", flex: 1, minHeight: "calc(100vh - 52px)" }}>

        {/* Left — brand panel */}
        <div style={{ background: "#431F5D", padding: "52px 48px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px" }}>
              Pact by Counselect
            </p>
            <h1 style={{ fontSize: "48px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1.15, margin: "0 0 20px" }}>
              Every deal<br />starts <span style={{ color: "#FB6A1B" }}>here.</span>
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0, maxWidth: "280px" }}>
              AI-native NDA generation and review, applied against each client's own legal standards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { num: "5", label: "Active clients" },
              { num: "<2 min", label: "Avg review time" },
              { num: "99%", label: "No escalation" },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: "22px", fontWeight: 500, color: "#FFFFFF", margin: "0 0 2px" }}>{s.num}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — client picker */}
        <div style={{ background: "#F0F2F5", padding: "32px 28px", display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: "16px", fontWeight: 500, color: "#1A1A1A", margin: "0 0 4px" }}>
            {greeting}{firstName ? `, ${firstName}` : ""}
          </p>
          <p style={{ fontSize: "13px", color: "#9B9B9B", margin: "0 0 20px" }}>
            Select a client to load their playbook.
          </p>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "0.5px solid #D8DAE0", borderRadius: "8px", padding: "9px 12px", marginBottom: "12px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: "13px", color: "#9B9B9B" }} />
            <input
              type="text"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "13px", color: "#1A1A1A", background: "transparent", flex: 1 }}
            />
          </div>

          {/* Client list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            {filtered.map(client => {
              const isSel = selected?.id === client.id
              return (
                <div key={client.id} onClick={() => setSelected(client)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "11px 14px", background: isSel ? "#F3EEF7" : "#FFFFFF",
                    border: isSel ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8",
                    borderRadius: "8px", cursor: "pointer",
                  }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "7px", background: client.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 500, color: client.textColor, flexShrink: 0 }}>
                    {client.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: isSel ? "#431F5D" : "#1A1A1A", margin: "0 0 1px" }}>{client.display_name}</p>
                    <p style={{ fontSize: "11px", color: "#9B9B9B", margin: 0 }}>{client.jurisdiction} · {client.entities} {client.entities === 1 ? "entity" : "entities"}</p>
                  </div>
                  {isSel && (
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#431F5D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "11px", color: "#FFFFFF" }} />
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ fontSize: "13px", color: "#9B9B9B", textAlign: "center", padding: "32px 0" }}>No clients found</p>
            )}
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              marginTop: "20px", width: "100%", padding: "12px", borderRadius: "8px",
              border: "none", background: "#431F5D", color: "#FFFFFF",
              fontSize: "13px", fontWeight: 500, cursor: selected ? "pointer" : "not-allowed",
              opacity: selected ? 1 : 0.35, display: "flex", alignItems: "center",
              justifyContent: "center", gap: "6px", transition: "opacity 0.15s",
            }}>
            {selected ? `Continue as ${selected.display_name}` : "Select a client to continue"}
            <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "13px" }} />
          </button>
        </div>
      </div>
    </main>
  )
}
