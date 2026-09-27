"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="font-medium text-xl" style={{ color: "#FFFFFF" }}>Pact</span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }}
      />
    </div>
  )
}

function NavBar({ firstName, lastName }: { firstName: string; lastName: string }) {
  return (
    <nav className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
        {firstName && lastName ? `${firstName} ${lastName}` : "..."} · Admin · <Link href="/" className="hover:underline" style={{ color: "rgba(255,255,255,0.65)" }}>Log out</Link>
      </span>
    </nav>
  )
}

interface Submission {
  id: string
  created_at: string
  completed_at: string | null
  flow: string
  status: string
  output_state: string | null
  escalation_flag: boolean
  counterparty_name: string | null
  purpose: string | null
  claude_model: string | null
  client_id: string
  user_id: string
}

interface AuditEntry {
  id: string
  created_at: string
  clause_type: string
  deviation_severity: string
  action_taken: string
  user_name: string
  user_email: string
  client_name: string
}

interface UserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  client_id: string
}

interface ClientRow {
  id: string
  display_name: string
}

function OutputStateBadge({ state }: { state: string | null }) {
  if (!state) return <span style={{ color: "#9B9B9B", fontSize: "12px" }}>—</span>
  const styles: Record<string, { bg: string; color: string }> = {
    compliant: { bg: "#E8F5E9", color: "#1B5E20" },
    minor: { bg: "#FFF3E0", color: "#E65100" },
    major: { bg: "#FFEBEE", color: "#B71C1C" },
    escalation: { bg: "#F3EEF7", color: "#431F5D" }
  }
  const s = styles[state] || { bg: "#F5F5F5", color: "#4A4A6A" }
  return (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </span>
  )
}

function FlowBadge({ flow }: { flow: string }) {
  return (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full"
      style={{
        backgroundColor: flow === "review" ? "#E6F1FB" : "#F3EEF7",
        color: flow === "review" ? "#0C447C" : "#431F5D"
      }}>
      {flow.charAt(0).toUpperCase() + flow.slice(1)}
    </span>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [filterFlow, setFilterFlow] = useState<string>("all")
  const [filterClient, setFilterClient] = useState<string>("all")
  const [filterState, setFilterState] = useState<string>("all")

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }

      // Check admin role
      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, role")
        .eq("id", session.user.id)
        .single()

      if (!userData || userData.role !== "admin") {
        router.push("/home")
        return
      }

      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")

      // Load all submissions
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (submissionsData) setSubmissions(submissionsData)

      // Load all users
      const { data: usersData } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, client_id")

      if (usersData) setUsers(usersData)

      // Load all clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, display_name")

      if (clientsData) setClients(clientsData)

      setLoaded(true)
    }

    load()
  }, [router])

  const loadAuditLog = async (submissionId: string) => {
    if (selectedSubmission === submissionId) {
      setSelectedSubmission(null)
      setAuditEntries([])
      return
    }
    setSelectedSubmission(submissionId)
    setLoadingAudit(true)
    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true })
    setAuditEntries(data || [])
    setLoadingAudit(false)
  }

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId)
    return u ? `${u.first_name} ${u.last_name}`.trim() : "—"
  }

  const getUserEmail = (userId: string) => {
    const u = users.find(u => u.id === userId)
    return u?.email || "—"
  }

  const getClientName = (clientId: string) => {
    const c = clients.find(c => c.id === clientId)
    return c?.display_name || "—"
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const filteredSubmissions = submissions.filter(s => {
    if (filterFlow !== "all" && s.flow !== filterFlow) return false
    if (filterClient !== "all" && s.client_id !== filterClient) return false
    if (filterState !== "all" && s.output_state !== filterState) return false
    return true
  })

  const stats = {
    total: submissions.length,
    review: submissions.filter(s => s.flow === "review").length,
    generate: submissions.filter(s => s.flow === "generate").length,
    escalations: submissions.filter(s => s.escalation_flag).length
  }

  if (!loaded) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "#4A4A6A", fontSize: "13px" }}>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar firstName={firstName} lastName={lastName} />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-medium mb-1" style={{ color: "#431F5D", fontSize: "20px" }}>
            Admin
          </h1>
          <p style={{ color: "#9B9B9B", fontSize: "13px" }}>
            Submission log and audit trail across all clients.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total submissions", value: stats.total },
            { label: "Reviews", value: stats.review },
            { label: "Generates", value: stats.generate },
            { label: "Escalations", value: stats.escalations }
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}>
              <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "6px" }}>{stat.label}</p>
              <p style={{ fontSize: "24px", fontWeight: 500, color: "#431F5D" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select
            value={filterFlow}
            onChange={e => setFilterFlow(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8", color: "#431F5D" }}
          >
            <option value="all">All flows</option>
            <option value="review">Review</option>
            <option value="generate">Generate</option>
          </select>

          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8", color: "#431F5D" }}
          >
            <option value="all">All clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>

          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8", color: "#431F5D" }}
          >
            <option value="all">All output states</option>
            <option value="compliant">Compliant</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="escalation">Escalation</option>
          </select>

          <span style={{ fontSize: "12px", color: "#9B9B9B", marginLeft: "auto" }}>
            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Submissions table */}
        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}>

          {/* Table header */}
          <div className="grid px-4 py-3"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr 80px 100px 80px 40px",
              borderBottom: "1px solid #F0F0F0",
              backgroundColor: "#F7F8FA"
            }}>
            {["Counterparty", "User", "Client", "Flow", "Output", "Submitted", ""].map(h => (
              <p key={h} style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </p>
            ))}
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p style={{ fontSize: "13px", color: "#9B9B9B" }}>No submissions yet.</p>
            </div>
          ) : (
            filteredSubmissions.map(s => (
              <div key={s.id}>
                {/* Submission row */}
                <div
                  className="grid px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 80px 100px 80px 40px",
                    borderBottom: selectedSubmission === s.id ? "none" : "1px solid #F0F0F0",
                    backgroundColor: selectedSubmission === s.id ? "#F8F5FF" : undefined
                  }}
                  onClick={() => loadAuditLog(s.id)}
                >
                  <div>
                    <p style={{ fontSize: "13px", color: "#431F5D", fontWeight: 500 }}>
                      {s.counterparty_name || "—"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9B9B9B" }}>
                      {s.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#4A4A6A" }}>{getUserName(s.user_id)}</p>
                    <p style={{ fontSize: "11px", color: "#9B9B9B" }}>{getUserEmail(s.user_id)}</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#4A4A6A" }}>{getClientName(s.client_id)}</p>
                  <FlowBadge flow={s.flow || "—"} />
                  <OutputStateBadge state={s.output_state} />
                  <p style={{ fontSize: "11px", color: "#9B9B9B" }}>{formatDate(s.created_at)}</p>
                  <p style={{ fontSize: "12px", color: "#431F5D", textAlign: "center" }}>
                    {selectedSubmission === s.id ? "▲" : "▼"}
                  </p>
                </div>

                {/* Audit log drill-down */}
                {selectedSubmission === s.id && (
                  <div style={{ borderBottom: "1px solid #F0F0F0", backgroundColor: "#FAFAFA" }}>
                    <div className="px-6 py-4">
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                        Deviation actions
                      </p>

                      {loadingAudit ? (
                        <p style={{ fontSize: "12px", color: "#9B9B9B" }}>Loading...</p>
                      ) : auditEntries.length === 0 ? (
                        <p style={{ fontSize: "12px", color: "#9B9B9B" }}>No deviation actions logged for this submission.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {auditEntries.map(entry => (
                            <div key={entry.id}
                              className="flex items-center gap-4 px-3 py-2 rounded-lg"
                              style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E4E8" }}>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: entry.action_taken === "accepted" ? "#E8F5E9" : "#FFEBEE",
                                  color: entry.action_taken === "accepted" ? "#1B5E20" : "#B71C1C"
                                }}>
                                {entry.action_taken}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: entry.deviation_severity === "major" ? "#FFEBEE" : "#FFF3E0",
                                  color: entry.deviation_severity === "major" ? "#B71C1C" : "#E65100"
                                }}>
                                {entry.deviation_severity}
                              </span>
                              <p style={{ fontSize: "12px", color: "#431F5D", flex: 1 }}>{entry.clause_type}</p>
                              <p style={{ fontSize: "11px", color: "#9B9B9B", flexShrink: 0 }}>{entry.user_name}</p>
                              <p style={{ fontSize: "11px", color: "#9B9B9B", flexShrink: 0 }}>{formatDate(entry.created_at)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
