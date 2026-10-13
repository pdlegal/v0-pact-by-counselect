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
  { id: "d1ac6aca-47e2-459c-9430-8677dcc23500", display_name: "Acme Corp",            initials: "AC", jurisdiction: "England & Wales", entities: 2, bg: "#EEEDFE", color: "#3C3489" },
  { id: "dummy-02",                              display_name: "Meridian Technologies", initials: "MT", jurisdiction: "United States",   entities: 3, bg: "#E6F1FB", color: "#0C447C" },
  { id: "dummy-03",                              display_name: "Vantage Partners",      initials: "VP", jurisdiction: "Singapore",        entities: 1, bg: "#E1F5EE", color: "#085041" },
  { id: "dummy-04",                              display_name: "Northgate Group",       initials: "NG", jurisdiction: "Germany",          entities: 4, bg: "#FAECE7", color: "#712B13" },
  { id: "dummy-05",                              display_name: "Castellan Logistics",   initials: "CL", jurisdiction: "Netherlands",      entities: 2, bg: "#FAEEDA", color: "#633806" },
]

export default function HomePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<typeof CLIENTS[0] | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

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

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const filtered = CLIENTS.filter(c =>
    c.display_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleContinue = () => {
    if (!selected) return
    sessionStorage.setItem("selected_client_id", selected.id)
    sessionStorage.setItem("selected_client_name", selected.display_name)
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F0F2F5" }}>

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
        <PactWordmark />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          {firstName || "..."} · Counselect · <Link href="/" className="hover:underline" style={{ color: "rgba(255,255,255,0.55)" }}>Log out</Link>
        </span>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, padding: "48px 52px", display: "flex", flexDirection: "column" }}>

        {/* Heading */}
        <p style={{ fontSize: "13px", color: "#9B9B9B", margin: "0 0 4px" }}>
          {greeting}{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 style={{ fontSize: "26px", fontWeight: 500, color: "#1A1A1A", margin: "0 0 6px" }}>
          Which client are you working on?
        </h1>
        <p style={{ fontSize: "13px", color: "#9B9B9B", margin: "0 0 28px" }}>
          Select a client to load their NDA playbook and standards.
        </p>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "0.5px solid #D8DAE0", borderRadius: "8px", padding: "10px 14px", marginBottom: "24px", maxWidth: "400px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: "13px", color: "#1A1A1A", background: "transparent", flex: 1 }}
          />
        </div>

        {/* Section label */}
        <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
          Your clients
        </p>

        {/* Client grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "auto" }}>
          {filtered.map(client => {
            const isSel = selected?.id === client.id
            const isHov = hoveredId === client.id
            return (
              <div
                key={client.id}
                onClick={() => setSelected(client)}
                onMouseEnter={() => setHoveredId(client.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isSel ? "#F3EEF7" : "#FFFFFF",
                  border: isSel ? "1.5px solid #431F5D" : isHov ? "0.5px solid #431F5D" : "0.5px solid #E2E4E8",
                  borderRadius: "10px", padding: "18px 16px", cursor: "pointer",
                  transition: "border 0.12s",
                }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: client.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: client.color, marginBottom: "12px" }}>
                  {client.initials}
                </div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: isSel ? "#431F5D" : "#1A1A1A", margin: "0 0 3px" }}>
                  {client.display_name}
                </p>
                <p style={{ fontSize: "11px", color: "#9B9B9B", margin: 0 }}>
                  {client.jurisdiction} · {client.entities} {client.entities === 1 ? "entity" : "entities"}
                </p>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "#9B9B9B", fontSize: "13px" }}>
              No clients match your search
            </div>
          )}
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "28px", marginTop: "28px", borderTop: "0.5px solid #E2E4E8" }}>
          <span style={{ fontSize: "11px", color: "#9B9B9B", display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Pact by Counselect · NDA standards applied per client
          </span>
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              fontSize: "13px", fontWeight: 500, padding: "10px 24px", borderRadius: "8px",
              border: "none", background: "#431F5D", color: "#FFFFFF",
              cursor: selected ? "pointer" : "not-allowed",
              opacity: selected ? 1 : 0.35,
              display: "flex", alignItems: "center", gap: "6px",
              transition: "opacity 0.15s",
            }}>
            {selected ? `Continue as ${selected.display_name}` : "Select a client to continue"}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

      </div>
    </main>
  )
}
