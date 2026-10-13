"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

function ConfidenceScore({ confidence, reason }: { confidence: Issue["confidence"]; reason?: string }) {
  const config = {
    high: { label: "High", bg: "#EAF3DE", color: "#3B6D11", border: "#C0DD97", icon: "ti-check" },
    medium: { label: "Medium", bg: "#FAEEDA", color: "#854F0B", border: "#FAC775", icon: "ti-minus" },
    escalate: { label: "Low", bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", icon: "ti-alert-triangle" },
  }
  const c = config[confidence]
  return (
    <div style={{ marginBottom: "18px" }}>
      <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>
        Pact AI confidence score
      </p>
      <div style={{ backgroundColor: c.bg, border: `0.5px solid ${c.border}`, borderRadius: "6px", padding: "7px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: reason ? "3px" : 0 }}>
          <i className={`ti ${c.icon}`} aria-hidden="true" style={{ fontSize: "12px", color: c.color }} />
          <span style={{ fontSize: "12px", fontWeight: 500, color: c.color }}>{c.label}</span>
        </div>
        {reason && (
          <p style={{ fontSize: "11px", color: c.color, lineHeight: 1.5, margin: 0, paddingLeft: "18px" }}>{reason}</p>
        )}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px", border: "0.5px solid #85B7EB", background: "#FFFFFF", color: "#0C447C", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
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
  const [fileName, setFileName] = useState("")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("review_result")
    const cp = sessionStorage.getItem("review_counterparty_name")
    const fn = sessionStorage.getItem("review_file_name")
    if (raw) {
      const parsed = JSON.parse(raw)
      setResult(parsed)
      if (parsed.issues?.length > 0) setSelectedIndex(0)
    }
    if (cp) setCounterpartyName(cp)
    if (fn) setFileName(fn)
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
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F0F2F5" }}>
        <p style={{ color: "#9B9B9B", fontSize: "13px" }}>Loading results...</p>
      </main>
    )
  }

  const issues = result.issues || []
  const majorCount = issues.filter(i => i.risk === "MAJOR").length
  const minorCount = issues.filter(i => i.risk === "MINOR").length
  const selectedIssue = selectedIndex !== null ? issues[selectedIndex] : null

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F0F2F5" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />

      {/* Page header */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "0.5px solid #E2E4E8", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>
              NDA Review
            </p>
            <p style={{ fontSize: "20px", fontWeight: 500, color: "#1A1A1A", margin: 0 }}>
              {counterpartyName || "Counterparty"}
            </p>
          </div>
          <button
            onClick={() => router.push("/home")}
            style={{ fontSize: "13px", fontWeight: 500, padding: "8px 18px", borderRadius: "6px", border: "none", background: "#431F5D", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginTop: "2px" }}>
            <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: "14px" }} />
            Complete review
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          {majorCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "8px", background: "#FCEBEB", border: "0.5px solid #F09595" }}>
              <span style={{ fontSize: "22px", fontWeight: 500, lineHeight: 1, color: "#791F1F" }}>{majorCount}</span>
              <span style={{ fontSize: "11px", lineHeight: 1.3, color: "#A32D2D" }}>major<br />deviations</span>
            </div>
          )}
          {minorCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "8px", background: "#FAEEDA", border: "0.5px solid #EF9F27" }}>
              <span style={{ fontSize: "22px", fontWeight: 500, lineHeight: 1, color: "#633806" }}>{minorCount}</span>
              <span style={{ fontSize: "11px", lineHeight: 1.3, color: "#854F0B" }}>minor<br />deviations</span>
            </div>
          )}
          {issues.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "8px", background: "#EAF3DE", border: "0.5px solid #C0DD97" }}>
              <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "18px", color: "#3B6D11" }} />
              <span style={{ fontSize: "11px", color: "#3B6D11", fontWeight: 500 }}>No deviations found</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center", paddingTop: "10px", borderTop: "0.5px solid #E2E4E8", flexWrap: "wrap" }}>
          {fileName && (
            <span style={{ fontSize: "11px", color: "#9B9B9B", display: "flex", alignItems: "center", gap: "4px" }}>
              <i className="ti ti-file-text" aria-hidden="true" style={{ fontSize: "12px" }} />
              {fileName}
            </span>
          )}
          <span style={{ fontSize: "11px", color: "#9B9B9B", display: "flex", alignItems: "center", gap: "4px" }}>
            <i className="ti ti-arrows-exchange" aria-hidden="true" style={{ fontSize: "12px" }} />
            {result.mutual_or_unilateral?.toLowerCase().startsWith("mutual") ? "Mutual NDA" : "Unilateral NDA"}
          </span>
          <span style={{ fontSize: "11px", color: "#9B9B9B", display: "flex", alignItems: "center", gap: "4px" }}>
            <i className="ti ti-scale" aria-hidden="true" style={{ fontSize: "12px" }} />
            Reviewed against {clientName}'s NDA standards
          </span>
          {result.escalate_to && result.escalate_to !== "none" && (
            <span style={{ fontSize: "11px", color: "#A32D2D", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
              <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: "12px" }} />
              Escalate to {result.escalate_to.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {issues.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "22px", color: "#3B6D11" }} />
            </div>
            <p style={{ fontSize: "16px", fontWeight: 500, color: "#1A1A1A", marginBottom: "6px" }}>No deviations found</p>
            <p style={{ fontSize: "13px", color: "#9B9B9B", marginBottom: "20px" }}>This NDA is compliant with {clientName}'s standards.</p>
            <button onClick={() => router.push("/home")} style={{ fontSize: "13px", fontWeight: 500, padding: "8px 18px", borderRadius: "6px", border: "none", background: "#431F5D", color: "#FFFFFF", cursor: "pointer" }}>
              Complete review
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 0 }}>

          {/* Sidebar — deep purple */}
          <div style={{ background: "#2D1648", borderRight: "0.5px solid #1A0D2E", padding: "12px 8px", overflowY: "auto" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 6px 10px" }}>
              {issues.length} clause{issues.length !== 1 ? "s" : ""}
            </p>
            {issues.map((issue, index) => {
              const isSelected = selectedIndex === index
              const isMajor = issue.risk === "MAJOR"
              return (
                <div key={index} onClick={() => setSelectedIndex(index)}
                  style={{
                    padding: "8px 10px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px",
                    display: "flex", alignItems: "flex-start", gap: "8px",
                    backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    border: isSelected ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid transparent",
                  }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, marginTop: "4px", backgroundColor: isMajor ? "#E24B4A" : "#EF9F27" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: isSelected ? "#FFFFFF" : (isMajor ? "#F09595" : "#FAC775"), marginBottom: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {issue.clause}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      {isMajor ? "Major deviation" : "Minor deviation"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right panel */}
          {selectedIssue ? (
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: "#FFFFFF" }}>

              <div style={{ padding: "16px 22px 13px", borderBottom: "0.5px solid #E2E4E8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#1A1A1A" }}>{selectedIssue.clause}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px",
                    background: selectedIssue.risk === "MAJOR" ? "#FCEBEB" : "#FAEEDA",
                    color: selectedIssue.risk === "MAJOR" ? "#A32D2D" : "#854F0B"
                  }}>
                    {selectedIssue.risk === "MAJOR" ? "Major deviation" : "Minor deviation"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#5F5E5A", margin: 0, lineHeight: 1.5 }}>{selectedIssue.issue}</p>
              </div>

              <div style={{ padding: "18px 22px", flex: 1, overflowY: "auto" }}>

                <ConfidenceScore confidence={selectedIssue.confidence} reason={selectedIssue.confidence_reason} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", marginBottom: "18px", alignItems: "stretch" }}>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>
                      Counterparty position
                    </p>
                    <div style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: "6px", padding: "11px 14px", height: "calc(100% - 23px)", boxSizing: "border-box" }}>
                      <p style={{ fontSize: "12px", color: "#1A1A1A", lineHeight: 1.75, margin: 0 }}>{selectedIssue.counterparty_position}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "18px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 500, color: "#888780", background: "#F0F2F5", border: "0.5px solid #D3D1C7", borderRadius: "10px", padding: "2px 6px" }}>vs</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>
                      {clientName} standard position
                    </p>
                    <div style={{ background: "#EEEDFE", border: "0.5px solid #AFA9EC", borderRadius: "6px", padding: "11px 14px", height: "calc(100% - 23px)", boxSizing: "border-box" }}>
                      <p style={{ fontSize: "12px", color: "#1A1A1A", lineHeight: 1.75, margin: 0, fontWeight: 500 }}>{selectedIssue.standard_position}</p>
                    </div>
                  </div>
                </div>

                {selectedIssue.suggested_change && (
                  <>
                    <p style={{ fontSize: "10px", fontWeight: 500, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>
                      Suggested language
                    </p>
                    <div style={{ border: "0.5px solid #85B7EB", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ background: "#E6F1FB", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid #85B7EB" }}>
                        <span style={{ fontSize: "10px", fontWeight: 500, color: "#0C447C", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: "5px" }}>
                          <i className="ti ti-wand" aria-hidden="true" style={{ fontSize: "12px" }} />
                          Proposed replacement
                        </span>
                        <CopyButton text={selectedIssue.suggested_change} />
                      </div>
                      <div style={{ padding: "12px 14px", fontSize: "12px", lineHeight: 1.8, color: "#1A1A1A" }}>
                        {selectedIssue.suggested_change}
                      </div>
                      <div style={{ padding: "5px 14px 7px", fontSize: "11px", color: "#185FA5", background: "#D6E8F8", borderTop: "0.5px solid #85B7EB" }}>
                        Drawn from {clientName}'s playbook. Review before use.
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div style={{ padding: "10px 22px", borderTop: "0.5px solid #E2E4E8", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAFA" }}>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
                  disabled={selectedIndex === 0}
                  style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "6px", border: "0.5px solid #D8DAE0", background: "#FFFFFF", color: "#1A1A1A", cursor: selectedIndex === 0 ? "not-allowed" : "pointer", opacity: selectedIndex === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  <i className="ti ti-arrow-left" aria-hidden="true" style={{ fontSize: "13px" }} /> Previous
                </button>
                <span style={{ fontSize: "12px", color: "#9B9B9B" }}>
                  Clause {(selectedIndex ?? 0) + 1} of {issues.length} · {majorCount} flagged
                </span>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null && prev < issues.length - 1 ? prev + 1 : prev)}
                  disabled={selectedIndex === issues.length - 1}
                  style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "6px", border: "0.5px solid #D8DAE0", background: "#FFFFFF", color: "#1A1A1A", cursor: selectedIndex === issues.length - 1 ? "not-allowed" : "pointer", opacity: selectedIndex === issues.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  Next <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: "13px" }} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
              <p style={{ fontSize: "13px", color: "#9B9B9B" }}>Select a clause to review</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
