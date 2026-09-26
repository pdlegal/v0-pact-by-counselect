"use client"

import { useState, useMemo, useEffect } from "react"
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

function NavBar({ firstName, lastName, clientName }: { firstName: string; lastName: string; clientName: string }) {
  return (
    <nav className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
        {firstName && lastName ? `${firstName} ${lastName}` : "..."} · {clientName || ""}
      </span>
    </nav>
  )
}

type DeviationStatus = "pending" | "accepted" | "rejected"

interface Deviation {
  id: number
  type: "minor" | "major" | "escalation"
  title: string
  counterparty: string
  standard: string
  reason: string
  suggestedChange: string
  status: DeviationStatus
  declarationChecked?: boolean
  approvedBy?: string
  approvalDate?: string
  showApprovalForm?: boolean
}

function RiskBadge({ type }: { type: "minor" | "major" | "escalation" }) {
  const styles = {
    minor: { bg: "#FFF3E0", color: "#E65100" },
    major: { bg: "#FFEBEE", color: "#B71C1C" },
    escalation: { bg: "#F5F5F5", color: "#4A4A6A" }
  }
  const labels = { minor: "Minor", major: "Major", escalation: "Escalation" }
  return (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full"
      style={{ backgroundColor: styles[type].bg, color: styles[type].color }}>
      {labels[type]}
    </span>
  )
}

function StatusBadge({ status }: { status: DeviationStatus }) {
  if (status === "pending") return null
  const styles = {
    accepted: { bg: "#E8F5E9", color: "#1B5E20" },
    rejected: { bg: "#FFEBEE", color: "#B71C1C" }
  }
  return (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full"
      style={{ backgroundColor: styles[status].bg, color: styles[status].color }}>
      {status === "accepted" ? "Accepted" : "Rejected"}
    </span>
  )
}

function SuggestedChangeBlock({ suggestedChange }: { suggestedChange: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedChange)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 pb-4" style={{ borderTop: "1px solid #F0F0F0", paddingTop: "12px" }}>
      <p className="text-xs font-medium uppercase mb-3" style={{ color: "#431F5D", letterSpacing: "0.06em" }}>
        Suggested change
      </p>

      {/* Suggested change text with copy button */}
      <div
        className="rounded-lg p-3 mb-3 flex items-start gap-3"
        style={{ backgroundColor: "#F0FAF4", border: "0.5px solid #A5D6B7" }}
      >
        <p className="text-xs leading-relaxed flex-1" style={{ color: "#1B5E20" }}>
          {suggestedChange}
        </p>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{
            backgroundColor: copied ? "#1B5E20" : "#FFFFFF",
            color: copied ? "#FFFFFF" : "#1B5E20",
            border: "0.5px solid #A5D6B7"
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <p className="text-xs mb-2" style={{ color: "#9B9B9B" }}>
        Apply this change to the counterparty draft, then share the updated version for signature.
      </p>
    </div>
  )
}

function DeviationCard({
  deviation, clientName, onStatusChange, onDeclarationChange, onApprovalFieldChange, onShowApprovalForm
}: {
  deviation: Deviation
  clientName: string
  onStatusChange: (id: number, status: DeviationStatus) => void
  onDeclarationChange?: (id: number, checked: boolean) => void
  onApprovalFieldChange?: (id: number, field: "approvedBy" | "approvalDate", value: string) => void
  onShowApprovalForm?: (id: number, show: boolean) => void
}) {
  const isEscalation = deviation.type === "escalation"
  const isMajor = deviation.type === "major"
  const canAcceptMajor = isMajor
    ? (deviation.declarationChecked && deviation.approvedBy?.trim() && deviation.approvalDate?.trim())
    : true
  const showApprovalForm = isMajor && deviation.showApprovalForm
  const displayName = clientName || "your company"
  const isRejected = deviation.status === "rejected"

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{
        border: deviation.type === "major"
          ? "1.5px solid #FFCDD2"
          : deviation.type === "escalation"
          ? "1.5px solid #FB6A1B"
          : "1.5px solid #FFE0B2",
        backgroundColor: "#FFFFFF"
      }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: deviation.type === "major"
            ? "#FFF5F5"
            : deviation.type === "escalation"
            ? "#FFF8F5"
            : "#FFFBF5"
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: "#431F5D" }}>{deviation.title}</span>
          <RiskBadge type={deviation.type} />
          <StatusBadge status={deviation.status} />
        </div>
      </div>

      {/* Side-by-side positions */}
      {!isEscalation && (
        <div className="grid grid-cols-2" style={{ borderBottom: "1px solid #F0F0F0" }}>
          <div className="p-4" style={{ borderRight: "1px solid #F0F0F0", backgroundColor: "#FFFBF5" }}>
            <p className="text-xs font-medium uppercase mb-2" style={{ color: "#E65100", letterSpacing: "0.06em" }}>
              Counterparty
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#4A4A6A" }}>
              {deviation.counterparty || "—"}
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: "#431F5D" }}
            >
              <span style={{ color: "#FFFFFF", fontSize: "9px", fontWeight: 600 }}>vs</span>
            </div>
            <div className="p-4" style={{ backgroundColor: "#F8F5FF" }}>
              <p className="text-xs font-medium uppercase mb-2" style={{ color: "#431F5D", letterSpacing: "0.06em" }}>
                {displayName} standard
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#431F5D" }}>
                {deviation.standard || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Issue description */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#4A4A6A" }}>{deviation.reason}</p>
      </div>

      {/* Suggested change — shown when rejected */}
      {isRejected && deviation.suggestedChange && (
        <SuggestedChangeBlock suggestedChange={deviation.suggestedChange} />
      )}

      {/* Major deviation approval form */}
      {showApprovalForm && (
        <div className="px-4 pb-3" style={{ borderTop: "1px solid #F0F0F0" }}>
          <div className="p-3 rounded-lg mt-3" style={{ backgroundColor: "#F7F8FA" }}>
            <p className="text-xs mb-3 font-medium" style={{ color: "#431F5D" }}>
              To accept this major deviation, please provide approval details:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#4A4A6A" }}>
                  Approved by <span style={{ color: "#B71C1C" }}>*</span>
                </label>
                <input
                  type="text"
                  value={deviation.approvedBy || ""}
                  onChange={(e) => onApprovalFieldChange?.(deviation.id, "approvedBy", e.target.value)}
                  placeholder="Name of approver"
                  className="w-full px-3 py-2 text-xs rounded-md"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8", color: "#431F5D" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#4A4A6A" }}>
                  Date approved <span style={{ color: "#B71C1C" }}>*</span>
                </label>
                <input
                  type="date"
                  value={deviation.approvalDate || ""}
                  onChange={(e) => onApprovalFieldChange?.(deviation.id, "approvalDate", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8", color: "#431F5D" }}
                />
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deviation.declarationChecked || false}
                onChange={(e) => onDeclarationChange?.(deviation.id, e.target.checked)}
                className="mt-0.5 w-4 h-4"
                style={{ accentColor: "#FB6A1B" }}
              />
              <span className="text-xs" style={{ color: "#4A4A6A" }}>
                I confirm I have received the necessary approval to accept this deviation.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isEscalation && (
        <div className="px-4 py-3 flex items-center justify-end gap-2" style={{ borderTop: "1px solid #F0F0F0" }}>
          <button
            onClick={() => {
              if (isMajor) onShowApprovalForm?.(deviation.id, false)
              onStatusChange(deviation.id, deviation.status === "rejected" ? "pending" : "rejected")
            }}
            className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: isRejected ? "#FFEBEE" : "#F7F8FA",
              color: isRejected ? "#B71C1C" : "#4A4A6A",
              border: isRejected ? "1px solid #FFCDD2" : "1px solid #E2E4E8",
              cursor: "pointer"
            }}
          >
            {isRejected ? "Rejected" : "Reject"}
          </button>
          <button
            onClick={() => {
              if (isMajor && !showApprovalForm) {
                onShowApprovalForm?.(deviation.id, true)
              } else if (!isMajor || canAcceptMajor) {
                onStatusChange(deviation.id, "accepted")
              }
            }}
            disabled={Boolean(isMajor && showApprovalForm && !canAcceptMajor)}
            className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: deviation.status === "accepted" ? "#E8F5E9" : "#431F5D",
              color: deviation.status === "accepted" ? "#1B5E20" : "#FFFFFF",
              border: deviation.status === "accepted" ? "1px solid #C8E6C9" : "none",
              opacity: (isMajor && showApprovalForm && !canAcceptMajor) ? 0.5 : 1,
              cursor: (isMajor && showApprovalForm && !canAcceptMajor) ? "not-allowed" : "pointer"
            }}
          >
            {isMajor && !showApprovalForm && deviation.status === "pending"
              ? "Accept with approval"
              : "Accept as is"}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DeviationTablePage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [clientName, setClientName] = useState("")
  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [documentSummary, setDocumentSummary] = useState("")
  const [overallRiskLevel, setOverallRiskLevel] = useState("")
  const [mutualOrUnilateral, setMutualOrUnilateral] = useState("")
  const [escalateTo, setEscalateTo] = useState("")
  const [counterpartyName, setCounterpartyName] = useState("")
  const [loaded, setLoaded] = useState(false)

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

  useEffect(() => {
    const raw = sessionStorage.getItem("review_result")
    const name = sessionStorage.getItem("review_counterparty_name")
    if (!raw) { router.push("/review"); return }

    const data = JSON.parse(raw)
    setDocumentSummary(data.document_summary || "")
    setOverallRiskLevel(data.overall_risk_level || "")
    setMutualOrUnilateral(data.mutual_or_unilateral || "")
    setEscalateTo(data.escalate_to || "none")
    setCounterpartyName(name || "Counterparty")

    const issues: Deviation[] = (data.issues || []).map((item: {
      risk: string
      clause: string
      issue: string
      counterparty_position?: string
      standard_position?: string
      suggested_change?: string
    }, index: number) => ({
      id: index + 1,
      type: item.risk === "MAJOR" ? "major" : "minor",
      title: item.clause,
      counterparty: item.counterparty_position || "",
      standard: item.standard_position || "",
      reason: item.issue,
      suggestedChange: item.suggested_change || "",
      status: "pending" as DeviationStatus,
      declarationChecked: false
    }))

    setDeviations(issues)
    setLoaded(true)
  }, [router])

  const handleStatusChange = (id: number, status: DeviationStatus) =>
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, status } : d))

  const handleDeclarationChange = (id: number, checked: boolean) =>
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, declarationChecked: checked } : d))

  const handleApprovalFieldChange = (id: number, field: "approvedBy" | "approvalDate", value: string) =>
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))

  const handleShowApprovalForm = (id: number, show: boolean) =>
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, showApprovalForm: show } : d))

  const actionableDeviations = deviations.filter(d => d.type !== "escalation")
  const actionedCount = actionableDeviations.filter(d => d.status !== "pending").length
  const totalActionable = actionableDeviations.length
  const allActioned = actionedCount === totalActionable && totalActionable > 0
  const hasMajorAccepted = deviations.some(d => d.type === "major" && d.status === "accepted")
  const hasEscalation = deviations.some(d => d.type === "escalation")
  const onlyMinorDeviations = !deviations.some(d => d.type === "major" || d.type === "escalation")

  const majorDeviationsForApproval = deviations.filter(
    d => d.type === "major" && (d.status === "pending" || d.showApprovalForm)
  )

  const summaryStats = useMemo(() => ({
    minor: deviations.filter(d => d.type === "minor").length,
    major: deviations.filter(d => d.type === "major").length,
    escalation: deviations.filter(d => d.type === "escalation").length
  }), [deviations])

  const minorDeviations = deviations.filter(d => d.type === "minor")
  const majorDeviations = deviations.filter(d => d.type === "major")
  const escalations = deviations.filter(d => d.type === "escalation")
  const displayName = clientName || "your company"

  const handleNotifyLegal = () => {
    const clauseList = escalations.map(d => `- ${d.title}: ${d.counterparty}`).join('\n')
    const emailSubject = encodeURIComponent("NDA Review — Escalation Required")
    const emailBody = encodeURIComponent(
      `Dear Legal Team,\n\nAn NDA review has identified the following clause(s) that require legal review:\n\n${clauseList}\n\nPlease review and provide a version ready to send to the counterparty.\n\nThank you.`
    )
    window.location.href = `mailto:legal@counselect.com?subject=${emailSubject}&body=${emailBody}`
  }

  const handleRequestApproval = () => {
    const emailSubject = encodeURIComponent("Approval Required: Major NDA Deviations")
    const emailBody = encodeURIComponent(
      `Dear Business Head,\n\nI am requesting your approval for the following major deviations identified in an NDA review:\n\n${majorDeviationsForApproval.map(d =>
        `Clause: ${d.title}\nCounterparty position: ${d.counterparty}\n${displayName} standard: ${d.standard}\nReason: ${d.reason}`
      ).join('\n\n')}\n\nPlease confirm your approval by replying to this email.\n\nThank you.`
    )
    window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`
  }

  const overallRiskColor = overallRiskLevel === "MAJOR"
    ? "#B71C1C" : overallRiskLevel === "MINOR"
    ? "#E65100" : "#1B5E20"
  const overallRiskBg = overallRiskLevel === "MAJOR"
    ? "#FFEBEE" : overallRiskLevel === "MINOR"
    ? "#FFF3E0" : "#E8F5E9"

  if (!loaded) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
        <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "#4A4A6A", fontSize: "13px" }}>Loading results...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar firstName={firstName} lastName={lastName} clientName={clientName} />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-medium mb-1" style={{ color: "#431F5D", fontSize: "20px" }}>
            {`NDA reviewed against ${displayName}'s playbook`}
          </h1>
          <p style={{ color: "#4A4A6A", fontSize: "13px" }}>{counterpartyName}</p>
        </div>

        {/* Instruction line */}
        <p className="mb-6" style={{ fontSize: "13px", color: "#4A4A6A" }}>
          Review each deviation. For items you reject, a suggested change will appear for you to apply to the counterparty draft.
        </p>

        {/* Summary strip */}
        <div
          className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: overallRiskBg, color: overallRiskColor }}>
              {overallRiskLevel} risk
            </span>
          </div>
          <div className="h-4 w-px" style={{ backgroundColor: "#E2E4E8" }} />
          <span className="text-xs" style={{ color: "#4A4A6A" }}>
            <strong style={{ color: "#E65100" }}>{summaryStats.minor}</strong> minor
          </span>
          <span className="text-xs" style={{ color: "#4A4A6A" }}>
            <strong style={{ color: "#B71C1C" }}>{summaryStats.major}</strong> major
          </span>
          {summaryStats.escalation > 0 && (
            <span className="text-xs" style={{ color: "#4A4A6A" }}>
              <strong>{summaryStats.escalation}</strong> escalation
            </span>
          )}
          <div className="h-4 w-px" style={{ backgroundColor: "#E2E4E8" }} />
          {mutualOrUnilateral && (
            <span className="text-xs" style={{ color: "#4A4A6A" }}>{mutualOrUnilateral}</span>
          )}
          <div className="ml-auto">
            <span className="text-xs" style={{ color: "#4A4A6A" }}>
              {actionedCount} of {totalActionable} actioned
            </span>
          </div>
        </div>

        {/* Document summary */}
        {documentSummary && (
          <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: "#F3EEF7", border: "1px solid #E8E0F0" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#431F5D" }}>Summary</p>
            <p className="text-sm leading-relaxed" style={{ color: "#4A4A6A" }}>{documentSummary}</p>
          </div>
        )}

        {/* Minor deviations */}
        {minorDeviations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium uppercase mb-3" style={{ color: "#E65100", letterSpacing: "0.08em" }}>
              Minor deviations — {minorDeviations.length}
            </h2>
            {minorDeviations.map(d => (
              <DeviationCard key={d.id} deviation={d} clientName={clientName}
                onStatusChange={handleStatusChange}
                onDeclarationChange={handleDeclarationChange}
                onApprovalFieldChange={handleApprovalFieldChange}
                onShowApprovalForm={handleShowApprovalForm}
              />
            ))}
          </div>
        )}

        {/* Major deviations */}
        {majorDeviations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium uppercase" style={{ color: "#B71C1C", letterSpacing: "0.08em" }}>
                Major deviations — {majorDeviations.length}
              </h2>
              {majorDeviationsForApproval.length > 0 && (
                <button onClick={handleRequestApproval}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#431F5D", color: "#FFFFFF" }}>
                  Request approval
                </button>
              )}
            </div>
            {majorDeviations.map(d => (
              <DeviationCard key={d.id} deviation={d} clientName={clientName}
                onStatusChange={handleStatusChange}
                onDeclarationChange={handleDeclarationChange}
                onApprovalFieldChange={handleApprovalFieldChange}
                onShowApprovalForm={handleShowApprovalForm}
              />
            ))}
          </div>
        )}

        {/* Escalations */}
        {escalations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium uppercase mb-3" style={{ color: "#4A4A6A", letterSpacing: "0.08em" }}>
              Requires attorney review — {escalations.length}
            </h2>
            {escalations.map(d => (
              <DeviationCard key={d.id} deviation={d} clientName={clientName}
                onStatusChange={handleStatusChange}
                onDeclarationChange={handleDeclarationChange}
                onApprovalFieldChange={handleApprovalFieldChange}
                onShowApprovalForm={handleShowApprovalForm}
              />
            ))}
            <button onClick={handleNotifyLegal}
              className="w-full py-3 rounded-xl font-medium mt-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#431F5D", color: "#FFFFFF", fontSize: "14px" }}>
              Notify legal
            </button>
          </div>
        )}

        {/* Status banners */}
        {hasMajorAccepted && !hasEscalation && (
          <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFE0B2" }}>
            <p style={{ color: "#E65100", fontSize: "13px" }}>
              This document contains major deviations. Ensure approvals are documented before sending.
            </p>
          </div>
        )}

        {allActioned && onlyMinorDeviations && (
          <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "#E8F5E9", border: "1px solid #C8E6C9" }}>
            <p style={{ color: "#1B5E20", fontSize: "13px" }}>
              All deviations reviewed. Apply the suggested changes to the counterparty draft before sending.
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          disabled={!allActioned || hasEscalation}
          onClick={() => allActioned && !hasEscalation && router.push("/review/output")}
          className="w-full py-3 rounded-xl font-medium transition-all mt-2"
          style={{
            background: (allActioned && !hasEscalation)
              ? "linear-gradient(135deg, #FB6A1B, #D2582F)"
              : "#E2E4E8",
            color: (allActioned && !hasEscalation) ? "#FFFFFF" : "#9B9B9B",
            cursor: (allActioned && !hasEscalation) ? "pointer" : "not-allowed",
            fontSize: "14px"
          }}
        >
          {hasEscalation
            ? "Awaiting legal review"
            : allActioned
              ? "Mark as complete"
              : "Action all deviations to unlock"
          }
        </button>
      </div>
    </main>
  )
}
