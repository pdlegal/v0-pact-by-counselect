"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type SubmissionStatus = "pending_review" | "in_progress" | "awaiting_approval" | "completed"
type DeviationSeverity = "minor" | "major" | "escalation"
type DeviationAction = "pending" | "accepted" | "rejected"

interface Deviation {
  id: string
  clause: string
  severity: DeviationSeverity
  counterpartyPosition: string
  standardPosition: string
  action: DeviationAction
  approvedBy?: string
  approvalDate?: string
}

interface Submission {
  id: string
  submittedAt: string
  submittedBy: string
  email: string
  client: string
  flow: "Review" | "Generate"
  counterpartyName: string
  status: SubmissionStatus
  deviations: Deviation[]
  turnaround?: string
  lastActivity?: string
}

interface AuditLogEntry {
  id: string
  submissionId: string
  timestamp: string
  action: string
  user: string
  details: string
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const mockSubmissions: Submission[] = [
  {
    id: "PKT-001",
    submittedAt: "20 May 2026 09:15",
    submittedBy: "John Doe",
    email: "john@technia.com",
    client: "TECHNIA",
    flow: "Review",
    counterpartyName: "Acme Corp",
    status: "awaiting_approval",
    lastActivity: "20 May 2026 09:45",
    deviations: [
      { id: "d1", clause: "Survival period", severity: "minor", counterpartyPosition: "5 years", standardPosition: "3 years", action: "accepted" },
      { id: "d2", clause: "Governing law", severity: "major", counterpartyPosition: "New York law", standardPosition: "English law", action: "pending" },
      { id: "d3", clause: "Indemnification cap", severity: "major", counterpartyPosition: "Unlimited", standardPosition: "Contract value", action: "pending" }
    ]
  },
  {
    id: "PKT-002",
    submittedAt: "19 May 2026 14:30",
    submittedBy: "Sarah Chen",
    email: "sarah@ayvens.com",
    client: "Ayvens",
    flow: "Review",
    counterpartyName: "Global Partners Ltd",
    status: "in_progress",
    lastActivity: "20 May 2026 08:12",
    deviations: [
      { id: "d4", clause: "Term duration", severity: "minor", counterpartyPosition: "2 years", standardPosition: "1 year", action: "pending" },
      { id: "d5", clause: "Non-solicitation", severity: "minor", counterpartyPosition: "24 months", standardPosition: "12 months", action: "pending" },
      { id: "d6", clause: "Exclusivity", severity: "escalation", counterpartyPosition: "Exclusive arrangement", standardPosition: "Non-exclusive", action: "pending" }
    ]
  },
  {
    id: "PKT-003",
    submittedAt: "18 May 2026 11:00",
    submittedBy: "Ravi Mehta",
    email: "ravi@kulfi.com",
    client: "Kulfi Collective",
    flow: "Review",
    counterpartyName: "TechStart Inc",
    status: "pending_review",
    lastActivity: "18 May 2026 11:00",
    deviations: []
  },
  {
    id: "PKT-004",
    submittedAt: "17 May 2026 16:45",
    submittedBy: "John Doe",
    email: "john@technia.com",
    client: "TECHNIA",
    flow: "Generate",
    counterpartyName: "DataFlow Systems",
    status: "completed",
    turnaround: "1m 23s",
    lastActivity: "17 May 2026 16:47",
    deviations: []
  },
  {
    id: "PKT-005",
    submittedAt: "16 May 2026 10:20",
    submittedBy: "Sarah Chen",
    email: "sarah@ayvens.com",
    client: "Ayvens",
    flow: "Review",
    counterpartyName: "Nexus Solutions",
    status: "awaiting_approval",
    lastActivity: "16 May 2026 14:30",
    deviations: [
      { id: "d7", clause: "Liability cap", severity: "major", counterpartyPosition: "No cap", standardPosition: "2x annual fees", action: "accepted", approvedBy: "Mark Johnson", approvalDate: "16 May 2026" },
      { id: "d8", clause: "IP ownership", severity: "major", counterpartyPosition: "Joint ownership", standardPosition: "Client retains all IP", action: "pending" }
    ]
  }
]

const mockAuditLog: AuditLogEntry[] = [
  { id: "a1", submissionId: "PKT-001", timestamp: "20 May 2026 09:45", action: "Deviation accepted", user: "John Doe", details: "Accepted minor deviation: Survival period" },
  { id: "a2", submissionId: "PKT-001", timestamp: "20 May 2026 09:30", action: "Review started", user: "John Doe", details: "Started reviewing deviations" },
  { id: "a3", submissionId: "PKT-001", timestamp: "20 May 2026 09:15", action: "Submission created", user: "John Doe", details: "NDA uploaded for review" },
  { id: "a4", submissionId: "PKT-002", timestamp: "20 May 2026 08:12", action: "Review resumed", user: "Sarah Chen", details: "Continued deviation review" },
  { id: "a5", submissionId: "PKT-002", timestamp: "19 May 2026 14:30", action: "Submission created", user: "Sarah Chen", details: "NDA uploaded for review" },
  { id: "a6", submissionId: "PKT-005", timestamp: "16 May 2026 14:30", action: "Major deviation accepted", user: "Sarah Chen", details: "Accepted Liability cap with approval from Mark Johnson" }
]

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function PactWordmark() {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline">
        <span className="text-xl font-medium text-white">Pact</span>
        <span
          className="inline-block rounded-full ml-0.5"
          style={{ 
            background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
            width: "6px",
            height: "6px"
          }}
        />
      </div>
      <span 
        className="text-xs font-normal"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        by Counselect
      </span>
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <div className="flex items-center gap-4">
        <Link 
          href="/admin"
          className="text-xs font-normal hover:underline"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Admin
        </Link>
        <span 
          className="text-xs font-normal"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Prajoy · <Link href="/" className="hover:underline">Log out</Link>
        </span>
      </div>
    </nav>
  )
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, { bg: string; color: string; text: string }> = {
    pending_review: { bg: "#FFF3E0", color: "#E65100", text: "Pending review" },
    in_progress: { bg: "#E3F2FD", color: "#1565C0", text: "In progress" },
    awaiting_approval: { bg: "#F3E5F5", color: "#7B1FA2", text: "Awaiting approval" },
    completed: { bg: "#E8F5E9", color: "#1B5E20", text: "Completed" }
  }
  const s = styles[status]
  return (
    <span 
      className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.text}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: DeviationSeverity }) {
  const styles: Record<DeviationSeverity, { bg: string; color: string; text: string }> = {
    minor: { bg: "#E8F5E9", color: "#1B5E20", text: "Minor" },
    major: { bg: "#FFF3E0", color: "#E65100", text: "Major" },
    escalation: { bg: "#FFEBEE", color: "#B71C1C", text: "Escalation" }
  }
  const s = styles[severity]
  return (
    <span 
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.text}
    </span>
  )
}

function ActionBadge({ action }: { action: DeviationAction }) {
  const styles: Record<DeviationAction, { bg: string; color: string; text: string }> = {
    pending: { bg: "#F7F8FA", color: "#4A4A6A", text: "Pending" },
    accepted: { bg: "#E8F5E9", color: "#1B5E20", text: "Accepted" },
    rejected: { bg: "#FFEBEE", color: "#B71C1C", text: "Rejected" }
  }
  const s = styles[action]
  return (
    <span 
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.text}
    </span>
  )
}

function MetricCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div 
      className="p-4 rounded-lg"
      style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}
    >
      <p className="text-xs mb-1" style={{ color: "#4A4A6A" }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: "#431F5D" }}>{value}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: "#9B9B9B" }}>{subtext}</p>}
    </div>
  )
}

function SubmissionRow({ 
  submission, 
  isExpanded, 
  onToggle,
  auditLog 
}: { 
  submission: Submission
  isExpanded: boolean
  onToggle: () => void
  auditLog: AuditLogEntry[]
}) {
  const pendingDeviations = submission.deviations.filter(d => d.action === "pending")
  const majorPending = pendingDeviations.filter(d => d.severity === "major" || d.severity === "escalation")
  
  return (
    <div 
      className="rounded-lg overflow-hidden mb-3"
      style={{ border: "1px solid #E2E4E8" }}
    >
      {/* Main Row */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>
                {submission.id}
              </span>
              <StatusBadge status={submission.status} />
              {majorPending.length > 0 && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: "#FFEBEE", color: "#B71C1C" }}
                >
                  {majorPending.length} action{majorPending.length > 1 ? "s" : ""} needed
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#4A4A6A" }}>
              <span>{submission.counterpartyName}</span>
              <span>{submission.client}</span>
              <span>{submission.flow}</span>
              <span>{submission.submittedBy}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs" style={{ color: "#4A4A6A" }}>Submitted</p>
              <p className="text-xs font-medium" style={{ color: "#431F5D" }}>{submission.submittedAt}</p>
            </div>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="#4A4A6A"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ borderTop: "1px solid #E2E4E8" }}>
          {/* Deviations Section */}
          {submission.deviations.length > 0 && (
            <div className="p-4" style={{ backgroundColor: "#F7F8FA" }}>
              <h4 
                className="uppercase text-xs font-medium mb-3"
                style={{ color: "#4A4A6A", letterSpacing: "0.05em" }}
              >
                Deviations ({submission.deviations.length})
              </h4>
              <div className="space-y-2">
                {submission.deviations.map((deviation) => (
                  <div 
                    key={deviation.id}
                    className="p-3 rounded-md"
                    style={{ 
                      backgroundColor: "#FFFFFF",
                      border: deviation.action === "pending" && (deviation.severity === "major" || deviation.severity === "escalation")
                        ? "1px solid #FB6A1B" 
                        : "1px solid #E2E4E8"
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" style={{ color: "#431F5D" }}>
                          {deviation.clause}
                        </span>
                        <SeverityBadge severity={deviation.severity} />
                      </div>
                      <ActionBadge action={deviation.action} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: "#4A4A6A" }}>Counterparty: </span>
                        <span style={{ color: "#431F5D" }}>{deviation.counterpartyPosition}</span>
                      </div>
                      <div>
                        <span style={{ color: "#4A4A6A" }}>Standard: </span>
                        <span style={{ color: "#431F5D" }}>{deviation.standardPosition}</span>
                      </div>
                    </div>
                    {deviation.approvedBy && (
                      <div className="mt-2 pt-2 text-xs" style={{ borderTop: "1px solid #E2E4E8", color: "#4A4A6A" }}>
                        Approved by {deviation.approvedBy} on {deviation.approvalDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Continue Review Button */}
              {pendingDeviations.length > 0 && submission.status !== "completed" && (
                <Link
                  href="/review/results"
                  className="inline-block mt-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
                >
                  Continue review
                </Link>
              )}
            </div>
          )}

          {/* Audit Log Section */}
          <div className="p-4" style={{ backgroundColor: "#FFFFFF" }}>
            <h4 
              className="uppercase text-xs font-medium mb-3"
              style={{ color: "#4A4A6A", letterSpacing: "0.05em" }}
            >
              Audit log
            </h4>
            {auditLog.length > 0 ? (
              <div className="space-y-2">
                {auditLog.map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 text-xs"
                    style={{ borderBottom: "1px solid #E2E4E8" }}
                  >
                    <span className="font-medium" style={{ color: "#431F5D", minWidth: "140px" }}>
                      {entry.timestamp}
                    </span>
                    <span style={{ color: "#4A4A6A" }}>{entry.action}</span>
                    <span style={{ color: "#9B9B9B" }}>by {entry.user}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "#9B9B9B" }}>No activity recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function PendingRequestsPage() {
  const [submissions] = useState<Submission[]>(mockSubmissions)
  const [auditLog] = useState<AuditLogEntry[]>(mockAuditLog)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all")
  const [clientFilter, setClientFilter] = useState<string>("all")

  // Compute metrics
  const metrics = useMemo(() => {
    const active = submissions.filter(s => s.status !== "completed")
    const awaitingApproval = submissions.filter(s => s.status === "awaiting_approval")
    const totalPendingDeviations = submissions.reduce(
      (acc, s) => acc + s.deviations.filter(d => d.action === "pending").length, 
      0
    )
    const majorPending = submissions.reduce(
      (acc, s) => acc + s.deviations.filter(d => d.action === "pending" && (d.severity === "major" || d.severity === "escalation")).length,
      0
    )
    return { 
      activeCount: active.length, 
      awaitingApproval: awaitingApproval.length,
      pendingDeviations: totalPendingDeviations,
      majorPending
    }
  }, [submissions])

  // Get unique clients for filter
  const clients = useMemo(() => {
    return Array.from(new Set(submissions.map(s => s.client)))
  }, [submissions])

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      if (clientFilter !== "all" && s.client !== clientFilter) return false
      return true
    })
  }, [submissions, statusFilter, clientFilter])

  // Get audit log for a submission
  const getAuditLog = (submissionId: string) => {
    return auditLog.filter(a => a.submissionId === submissionId)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-semibold mb-1" style={{ fontSize: "24px", color: "#431F5D" }}>
              Pending Requests
            </h1>
            <p style={{ fontSize: "14px", color: "#4A4A6A" }}>
              Track active submissions and outstanding deviations
            </p>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: "#431F5D",
              color: "#FFFFFF"
            }}
          >
            New submission
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Active submissions" value={metrics.activeCount} />
          <MetricCard label="Awaiting approval" value={metrics.awaitingApproval} />
          <MetricCard label="Pending deviations" value={metrics.pendingDeviations} />
          <MetricCard 
            label="Major/Escalations" 
            value={metrics.majorPending} 
            subtext={metrics.majorPending > 0 ? "Action required" : "None pending"}
          />
        </div>

        {/* Filters */}
        <div 
          className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg mb-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <div className="flex-1 sm:max-w-[200px]">
            <label className="block text-xs mb-1" style={{ color: "#4A4A6A" }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{ border: "1px solid #E2E4E8", color: "#431F5D", backgroundColor: "#FFFFFF" }}
            >
              <option value="all">All statuses</option>
              <option value="pending_review">Pending review</option>
              <option value="in_progress">In progress</option>
              <option value="awaiting_approval">Awaiting approval</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex-1 sm:max-w-[200px]">
            <label className="block text-xs mb-1" style={{ color: "#4A4A6A" }}>Client</label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{ border: "1px solid #E2E4E8", color: "#431F5D", backgroundColor: "#FFFFFF" }}
            >
              <option value="all">All clients</option>
              {clients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter("all"); setClientFilter("all") }}
              className="px-3 py-2 text-sm hover:underline"
              style={{ color: "#431F5D" }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div>
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map(submission => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                isExpanded={expandedId === submission.id}
                onToggle={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                auditLog={getAuditLog(submission.id)}
              />
            ))
          ) : (
            <div 
              className="p-8 rounded-lg text-center"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
            >
              <p style={{ color: "#4A4A6A", fontSize: "14px" }}>
                No submissions match your filters.
              </p>
              <button
                onClick={() => { setStatusFilter("all"); setClientFilter("all") }}
                className="mt-2 text-sm hover:underline"
                style={{ color: "#431F5D" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <h3 className="text-xs font-medium mb-3" style={{ color: "#4A4A6A" }}>Status guide</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>Pending review</span>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>NDA uploaded, not yet processed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#E3F2FD", color: "#1565C0" }}>In progress</span>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>User reviewing deviations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#F3E5F5", color: "#7B1FA2" }}>Awaiting approval</span>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>Major deviations need sign-off</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#E8F5E9", color: "#1B5E20" }}>Completed</span>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>All actions complete, NDA downloaded</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
