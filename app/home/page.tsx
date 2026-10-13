"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>Pact</span>
      <span className="inline-block rounded-full ml-0.5" style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }} />
    </div>
  )
}

const DUMMY_CLIENTS = [
  { id: "d1ac6aca-47e2-459c-9430-8677dcc23500", display_name: "Acme Corp", initials: "AC", jurisdiction: "England and Wales", entities: 2, color: "purple" },
  { id: "dummy-02", display_name: "Meridian Technologies", initials: "MT", jurisdiction: "United States", entities: 3, color: "blue" },
  { id: "dummy-03", display_name: "Vantage Partners", initials: "VP", jurisdiction: "Singapore", entities: 1, color: "teal" },
  { id: "dummy-04", display_name: "Northgate Group", initials: "NG", jurisdiction: "Germany", entities: 4, color: "coral" },
  { id: "dummy-05", display_name: "Castellan Logistics", initials: "CL", jurisdiction: "Netherlands", entities: 2, color: "amber" },
]

const AVATAR_COLORS: Record<string, { bg: string; color: string }> = {
  purple: { bg: "#EEEDFE", color: "#3C3489" },
  blue:   { bg: "#E6F1FB", color: "#0C447C" },
  teal:   { bg: "#E1F5EE", color: "#085041" },
  coral:  { bg: "#FAECE7", color: "#712B13" },
  amber:  { bg: "#FAEEDA", color: "#633806" },
}

export default function HomePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<typeof DUMMY_CLIENTS[0] | null>(null)

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

  const filtered = DUMMY_CLIENTS.filter(c =>
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
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F0F2F5" }}>
      <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
        <PactWordmark />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          {firstName || "..."} · Counselect · <Link href="/" className="hover:underline">Log out</Link>
        </span>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full" style={{ maxWidth: "680px" }}>

          <p style={{ fontSize: "13px", color: "#9B9B9B", margin: "0 0 4px" }}>{greeting}{firstName ? `, ${firstName}` : ""}</p>
          <p style={{ fontSize: "22px", fontWeight: 500, color: "#1A1A1A", margin: "0 0 6px" }}>Which client are you working on?</p>
          <p style={{ fontSize: "13px", color: "#5F5E5A", margin: "0 0 24px" }}>Select a client to load their NDA standards and playbook.</p>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "0.5px solid #D8DAE0", borderRadius: "8px", padding: "9px 14px", marginBottom: "20px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: "14px", color: "#9B9B9B" }} />
            <input
              type="text"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "13px", color: "#1A1A1A", background: "transparent", flex: 1 }}
            />
          </div>

          {/* Client grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
            {filtered.map(client => {
              const isSelected = selected?.id === client.id
              const av = AVATAR_COLORS[client.color]
              return (
                <div key={client.id} onClick={() => setSelected(client)}
                  style={{
                    background: isSelected ? "#F3EEF7" : "#FFFFFF",
                    border: isSelected ? "1.5px solid #431F5D" : "0.5px solid #E2E4E8",
                    borderRadius: "10px", padding: "16px", cursor: "pointer",
                  }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: av.color, marginBottom: "10px" }}>
                    {client.initials}
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: isSelected ? "#431F5D" : "#1A1A1A", margin: "0 0 2px" }}>{client.display_name}</p>
                  <p style={{ fontSize: "11px", color: "#9B9B9B", margin: 0 }}>{client.jurisdiction} · {client.entities} {client.entities === 1 ? "entity" : "entities"}</p>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px", color: "#9B9B9B", fontSize: "13px" }}>
                No clients found
              </div>
            )}
          </div>

          {/* Continue button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleContinue}
              disabled={!selected}
              style={{
                fontSize: "13px", fontWeight: 500, padding: "10px 24px", borderRadius: "7px",
                border: "none", background: "#431F5D", color: "#FFFFFF", cursor: selected ? "pointer" : "not-allowed",
                opacity: selected ? 1 : 0.4, display: "flex", alignItems: "center", gap: "6px",
                transition: "opacity 0.15s"
              }}>
              {selected ? `Continue as ${selected.display_name}` : "Select a client to continue"}
              <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "13px" }} />
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
