"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Issue {
  risk: "MINOR" | "MAJOR"
  clause: string
  issue: string
  counterparty_position: string
  standard_position: string
  suggested_change: string
  confidence: "high" | "medium" | "escalate"
  confidence_reason?: string
}

interface ReviewResult {
  overall_risk_level: "COMPLIANT" | "MINOR" | "MAJOR"
  mutual_or_unilateral: string
  escalate_to: string
  issues: Issue[]
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span className="text-xl font-medium" style={{ color: "#FFFFFF" }}>Pact</span>
      <span className="inline-block rounded-full ml-0.5" style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)", width: "6px", height: "6px" }} />
    </div>
  )
}

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
        {firstName && lastName ? `${firstName} ${lastName}` : "..."} · {clientName || ""} · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function ConfidenceBadge({ confidence, reason }: { confidence: Issue["confidence"]; reason?: string }) {
  const config = {
    high: {
      label: "High confidence",
      sublabel: null,
      bg: "#EAF3DE",
      color: "#3B6D11",
      border: "#C0DD97",
      icon: "ti-check",
    },
    medium: {
      label: "Review suggested",
      sublabel: reason || null,
      bg: "#FAEEDA",
      color: "#854F0B",
      border: "#FAC775",
      icon: "ti-eye",
    },
    escalate: {
      label: "Escalate to attorney",
      sublabel: reason || null,
      bg: "#FCEBEB",
      color: "#A32D2D",
      border: "#F7C1C1",
      icon: "ti-alert-circle",
    },
  }
  const c = config[confidence]
  return (
    <div style={{ backgroundColor: c.bg, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "8px 12px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: c.sublabel ? "3px" : 0 }}>
        <i className={`ti ${c.icon}`} aria-hidden="true" style={{ fontSize: "13px", color: c.color }} />
        <span style={{ fontSize: "12px", fontWeight: 500, color: c.color }}>{c.label}</span>
      </div>
      {c.sublabel && (
        <p style={{ fontSize: "12px", color: c.color, lineHeight: 1.5, margin: 0, paddingLeft: "19px" }}>{c.sublabel}</p>
      )}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px", border: "0.5px solid #B5D4F4", background: "#FFFFFF", color: "#185FA5", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
      <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" style={{ fontSize: "12px" }} />
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function ReviewResultsPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [counterpartyName, setCounterpartyName] = useState("")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("review_result")
    const cp = sessionStorage.getItem("review_counterparty_name")
    if (raw) {
      const parsed = JSON.parse(raw)
      setResult(parsed)
      // Auto-select first flagged clause
      if (parsed.issues && parsed.issues.length > 0) setSelectedIndex(0)
    }
    if (cp) setCounterpartyName(cp)
  }, [])

  useEffect(() => {
    async function loadClientData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: userData } = await supabase.from("users").select("first_name, last_name, client_id").eq("id", session.user.id).single()
      if (!userData) return
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")
      const { data: clientData } = await supabase.from("clients").select("display_name").eq("id", userData.client_id).single()
      if (clientData) setClientName(clientData.display_name || "")
    }
    loadClientData()
  }, [])

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F8FA" }}>
        <p style={{ color: "#9B9B9B", fontSize: "13px" }}>Loading results...</p>
      </main>
    )
  }

  const issues = result.issues || []
  const majorCount = issues.filter(i => i.risk === "MAJOR").length
  const minorCount = issues.filter(i => i.risk === "MINOR").length
  const cleanCount = issues.filter(i => !i.risk || i.risk === "COMPLIANT").length
  const selectedIssue = selectedIndex !== null ? issues[selectedIndex] : null

  const dotColor = (issue: Issue) => {
    if (issue.risk === "MAJOR") return "#E24B4A"
    if (issue.risk === "MINOR") return "#BA7517"
    return "#639922"
  }

  const dotLabel = (issue: Issue) => {
    if (issue.risk === "MAJOR") return "Major deviation"
    if (issue.risk === "MINOR") return "Minor deviation"
    return "Compliant"
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />

      {/* Top bar */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "0.5px solid #E2E4E8", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#431F5D" }}>{counterpartyName || "Counterparty"}</span>
          <span style={{ fontSize: "12px", color: "#9B9B9B" }}>·</span>
          <span style={{ fontSize: "12px", color: "#4A4A6A" }}>{result.mutual_or_unilateral?.split("—")[0]?.trim() || "MNDA"}</span>
          <span style={{ fontSize: "12px", color: "#9B9B9B" }}>·</span>
          <span style={{ fontSize: "12px", color: "#4A4A6A" }}>Reviewed against {clientName}'s NDA standards</span>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {majorCount > 0 && (
            <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px", background: "#FCEBEB", color: "#A32D2D" }}>{majorCount} major</span>
          )}
          {minorCount > 0 && (
            <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px", background: "#FAEEDA", color: "#854F0B" }}>{minorCount} minor</span>
          )}
          {issues.length === 0 && (
            <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px", background: "#EAF3DE", color: "#3B6D11" }}>Clean</span>
          )}
        </div>
      </div>

      {/* Meta strip */}
      <div style={{ backgroundColor: "#FAFAFA", borderBottom: "0.5px solid #E2E4E8", padding: "7px 20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#4A4A6A", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-arrows-exchange" aria-hidden="true" style={{ fontSize: "13px" }} />
          {result.mutual_or_unilateral?.split("—")[0]?.trim() || "—"}
        </span>
        <span style={{ fontSize: "12px", color: "#4A4A6A", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-file-text" aria-hidden="true" style={{ fontSize: "13px" }} />
          {sessionStorage.getItem("review_file_name") || "NDA document"}
        </span>
        {result.escalate_to && result.escalate_to !== "none" && (
          <span style={{ fontSize: "12px", color: "#A32D2D", display: "flex", alignItems: "center", gap: "5px", fontWeight: 500 }}>
            <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: "13px" }} />
            Escalate to {result.escalate_to.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Empty state */}
      {issues.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "22px", color: "#3B6D11" }} />
            </div>
            <p style={{ fontSize: "16px", fontWeight: 500, color: "#431F5D", marginBottom: "6px" }}>No deviations found</p>
            <p style={{ fontSize: "13px", color: "#9B9B9B", marginBottom: "20px" }}>This NDA is compliant with {clientName}'s standards.</p>
            <Link href="/home" style={{ fontSize: "13px", color: "#431F5D", textDecoration: "underline" }}>Back to home</Link>
          </div>
        </div>
      ) : (
        /* Clause editor */
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr", minHeight: 0 }}>

          {/* Left — clause list */}
          <div style={{ borderRight: "0.5px solid #E2E4E8", padding: "12px 10px", backgroundColor: "#FAFAFA", overflowY: "auto" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 4px 8px" }}>
              {issues.length} clause{issues.length !== 1 ? "s" : ""}
            </p>

            {issues.map((issue, index) => {
              const isSelected = selectedIndex === index
              const isMajor = issue.risk === "MAJOR"
              const isMinor = issue.risk === "MINOR"
              return (
                <div
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginBottom: "2px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    backgroundColor: isSelected
                      ? isMajor ? "#FCEBEB" : isMinor ? "#FAEEDA" : "#EAF3DE"
                      : "transparent",
                    border: isSelected
                      ? `0.5px solid ${isMajor ? "#F7C1C1" : isMinor ? "#FAC775" : "#C0DD97"}`
                      : "0.5px solid transparent",
                  }}
                >
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, marginTop: "4px", backgroundColor: dotColor(issue) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: isMajor ? "#A32D2D" : isMinor ? "#854F0B" : "#3B6D11", marginBottom: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {issue.clause}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9B9B9B" }}>{dotLabel(issue)}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right — analysis panel */}
          {selectedIssue ? (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

              {/* Panel header */}
              <div style={{ padding: "14px 20px 10px", borderBottom: "0.5px solid #E2E4E8", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#431F5D" }}>{selectedIssue.clause}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px",
                    background: selectedIssue.risk === "MAJOR" ? "#FCEBEB" : "#FAEEDA",
                    color: selectedIssue.risk === "MAJOR" ? "#A32D2D" : "#854F0B"
                  }}>
                    {selectedIssue.risk === "MAJOR" ? "Major deviation" : "Minor deviation"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#9B9B9B", margin: 0 }}>{selectedIssue.issue}</p>
              </div>

              {/* Panel body */}
              <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto", backgroundColor: "#FFFFFF" }}>

                {/* Confidence */}
                <ConfidenceBadge confidence={selectedIssue.confidence} reason={selectedIssue.confidence_reason} />

                {/* Counterparty position */}
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Counterparty position</p>
                <div style={{ background: "#F7F8FA", border: "0.5px solid #E2E4E8", borderRadius: "6px", padding: "10px 14px", fontSize: "12px", lineHeight: 1.7, color: "#431F5D", marginBottom: "16px" }}>
                  {selectedIssue.counterparty_position}
                </div>

                {/* Standard position */}
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{clientName} standard position</p>
                <div style={{ background: "#F3EEF7", border: "0.5px solid #D1C4E9", borderRadius: "6px", padding: "10px 14px", fontSize: "12px", lineHeight: 1.6, color: "#431F5D", marginBottom: "16px" }}>
                  {selectedIssue.standard_position}
                </div>

                {/* Suggested language */}
                {selectedIssue.suggested_change && (
                  <>
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Suggested language</p>
                    <div style={{ border: "0.5px solid #B5D4F4", borderRadius: "6px", overflow: "hidden", marginBottom: "16px" }}>
                      <div style={{ background: "#E6F1FB", padding: "7px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="ti ti-wand" aria-hidden="true" style={{ fontSize: "13px", color: "#185FA5" }} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.06em" }}>Proposed replacement</span>
                        </div>
                        <CopyButton text={selectedIssue.suggested_change} />
                      </div>
                      <div style={{ padding: "12px 14px", fontSize: "12px", lineHeight: 1.8, color: "#431F5D", background: "#FFFFFF" }}>
                        {selectedIssue.suggested_change}
                      </div>
                      <div style={{ padding: "6px 14px 8px", fontSize: "11px", color: "#9B9B9B", background: "#FAFAFA", borderTop: "0.5px solid #E2E4E8" }}>
                        Drawn from {clientName}'s playbook. Review before use.
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Nav footer */}
              <div style={{ padding: "10px 20px", borderTop: "0.5px solid #E2E4E8", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAFA" }}>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
                  disabled={selectedIndex === 0}
                  style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "6px", border: "0.5px solid #E2E4E8", background: "#FFFFFF", color: "#431F5D", cursor: selectedIndex === 0 ? "not-allowed" : "pointer", opacity: selectedIndex === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  <i className="ti ti-arrow-left" aria-hidden="true" style={{ fontSize: "13px" }} /> Previous
                </button>
                <span style={{ fontSize: "12px", color: "#9B9B9B" }}>
                  Clause {(selectedIndex ?? 0) + 1} of {issues.length} · {issues.filter(i => i.risk === "MAJOR").length} flagged
                </span>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null && prev < issues.length - 1 ? prev + 1 : prev)}
                  disabled={selectedIndex === issues.length - 1}
                  style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "6px", border: "0.5px solid #E2E4E8", background: "#FFFFFF", color: "#431F5D", cursor: selectedIndex === issues.length - 1 ? "not-allowed" : "pointer", opacity: selectedIndex === issues.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  Next <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "13px" }} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "13px", color: "#9B9B9B" }}>Select a clause to review</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
