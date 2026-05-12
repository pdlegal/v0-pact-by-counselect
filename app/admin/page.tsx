"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type PlaybookStatus = "healthy" | "review_recommended" | "review_overdue"
type UserStatus = "active" | "inactive"

interface Client {
  id: string
  name: string
  playbookVersion: string
  lastUpdated: string
  submissions: number
  escalations: number
  status: PlaybookStatus
  lastUpdatedBy: string
  effectiveDate: string
}

interface Submission {
  id: string
  date: string
  user: string
  email: string
  client: string
  flow: "Review" | "Generate"
  outputState: string
  escalation: boolean
  turnaround: string
  deviationLog?: DeviationLogEntry[]
}

interface DeviationLogEntry {
  clause: string
  severity: string
  decision: string
  user: string
  date: string
}

interface Domain {
  domain: string
  clientName: string
  playbook: string
  status: "active" | "inactive"
  added: string
}

interface User {
  name: string
  email: string
  client: string
  firstLogin: string
  lastLogin: string
  status: UserStatus
}

interface DiffRow {
  clause: string
  field: string
  oldValue: string
  newValue: string
  severityChange: string
  isEscalation: boolean
}

interface VersionHistory {
  version: string
  date: string
  updatedBy: string
  isInitial: boolean
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const initialClients: Client[] = [
  {
    id: "technia",
    name: "TECHNIA",
    playbookVersion: "v2.1",
    lastUpdated: "14 May 2026",
    submissions: 12,
    escalations: 0,
    status: "healthy",
    lastUpdatedBy: "Prajoy Dutta",
    effectiveDate: "14 May 2026"
  },
  {
    id: "ayvens",
    name: "Ayvens",
    playbookVersion: "v1.0",
    lastUpdated: "3 January 2026",
    submissions: 47,
    escalations: 4,
    status: "review_overdue",
    lastUpdatedBy: "Prajoy Dutta",
    effectiveDate: "3 January 2026"
  },
  {
    id: "kulfi",
    name: "Kulfi Collective",
    playbookVersion: "v1.2",
    lastUpdated: "28 March 2026",
    submissions: 8,
    escalations: 2,
    status: "review_recommended",
    lastUpdatedBy: "Prajoy Dutta",
    effectiveDate: "28 March 2026"
  }
]

const submissions: Submission[] = [
  {
    id: "PKT-001",
    date: "12 May 2026 14:32",
    user: "John Doe",
    email: "john@technia.com",
    client: "TECHNIA",
    flow: "Review",
    outputState: "Minor approved",
    escalation: false,
    turnaround: "1m 42s",
    deviationLog: [
      { clause: "Survival period", severity: "Minor", decision: "Rejected", user: "John Doe", date: "12 May 2026 14:30" },
      { clause: "Governing law", severity: "Minor", decision: "Accepted", user: "John Doe", date: "12 May 2026 14:31" },
      { clause: "Notice period", severity: "Minor", decision: "Rejected", user: "John Doe", date: "12 May 2026 14:31" }
    ]
  },
  {
    id: "PKT-002",
    date: "12 May 2026 11:15",
    user: "Sarah Chen",
    email: "sarah@ayvens.com",
    client: "Ayvens",
    flow: "Review",
    outputState: "Major flagged",
    escalation: true,
    turnaround: "3m 18s"
  },
  {
    id: "PKT-003",
    date: "11 May 2026 09:44",
    user: "Ravi Mehta",
    email: "ravi@kulfi.com",
    client: "Kulfi Collective",
    flow: "Generate",
    outputState: "Clean",
    escalation: false,
    turnaround: "0m 58s"
  },
  {
    id: "PKT-004",
    date: "10 May 2026 16:20",
    user: "John Doe",
    email: "john@technia.com",
    client: "TECHNIA",
    flow: "Review",
    outputState: "Sign as is",
    escalation: false,
    turnaround: "1m 12s"
  },
  {
    id: "PKT-005",
    date: "9 May 2026 10:05",
    user: "Sarah Chen",
    email: "sarah@ayvens.com",
    client: "Ayvens",
    flow: "Generate",
    outputState: "Clean",
    escalation: false,
    turnaround: "1m 03s"
  }
]

const domains: Domain[] = [
  { domain: "technia.com", clientName: "TECHNIA", playbook: "v2.1", status: "active", added: "10 Jan 2026" },
  { domain: "ayvens.com", clientName: "Ayvens", playbook: "v1.0", status: "active", added: "10 Jan 2026" },
  { domain: "kulfi.com", clientName: "Kulfi Collective", playbook: "v1.2", status: "active", added: "15 Mar 2026" }
]

const users: User[] = [
  { name: "John Doe", email: "john@technia.com", client: "TECHNIA", firstLogin: "10 Jan 2026", lastLogin: "12 May 2026", status: "active" },
  { name: "Sarah Chen", email: "sarah@ayvens.com", client: "Ayvens", firstLogin: "15 Jan 2026", lastLogin: "12 May 2026", status: "active" },
  { name: "Ravi Mehta", email: "ravi@kulfi.com", client: "Kulfi Collective", firstLogin: "20 Mar 2026", lastLogin: "11 May 2026", status: "active" }
]

const diffRows: DiffRow[] = [
  { clause: "term_duration", field: "survival_period", oldValue: "3 years", newValue: "4 years", severityChange: "minor → minor", isEscalation: false },
  { clause: "governing_law", field: "standard_position", oldValue: "English law", newValue: "English law or Swedish law at client's election", severityChange: "minor → minor", isEscalation: false },
  { clause: "jurisdiction", field: "severity_on_deviation", oldValue: "minor", newValue: "major", severityChange: "minor → MAJOR", isEscalation: true }
]

const versionHistory: VersionHistory[] = [
  { version: "v2.1", date: "14 May 2026", updatedBy: "Prajoy Dutta", isInitial: false },
  { version: "v1.2", date: "2 April 2026", updatedBy: "Prajoy Dutta", isInitial: false },
  { version: "v1.0", date: "10 January 2026", updatedBy: "Prajoy Dutta", isInitial: true }
]

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function PactWordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl font-medium text-white">Pact</span>
      <div 
        className="w-2 h-2 rounded-full"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="w-full px-4 py-3 flex items-center justify-between"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
        Prajoy (Admin) · Log out
      </span>
    </nav>
  )
}

function StatusBadge({ status }: { status: PlaybookStatus }) {
  const styles = {
    healthy: { bg: "#E8F5E9", color: "#1B5E20", text: "Healthy" },
    review_recommended: { bg: "#FFF3E0", color: "#E65100", text: "Review recommended" },
    review_overdue: { bg: "#FFEBEE", color: "#B71C1C", text: "Review overdue" }
  }
  const s = styles[status]
  return (
    <span 
      className="px-2 py-1 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.text}
    </span>
  )
}

function ActiveBadge() {
  return (
    <span 
      className="px-2 py-1 rounded text-xs font-medium"
      style={{ backgroundColor: "#E8F5E9", color: "#1B5E20" }}
    >
      Active
    </span>
  )
}

// ─────────────────────────────────────────────
// PANEL 1: PLAYBOOK HEALTH DASHBOARD
// ─────────────────────────────────────────────

function PlaybookHealthPanel({ 
  clients, 
  onUpdateClick 
}: { 
  clients: Client[]
  onUpdateClick: (clientId: string) => void 
}) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6" style={{ border: "1px solid #E2E4E8" }}>
      <h2 className="font-medium mb-4" style={{ fontSize: "16px", color: "#431F5D" }}>
        Playbook health
      </h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left" style={{ fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E4E8" }}>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Client</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Playbook version</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Last updated</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Submissions</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Escalations</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Status</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: "1px solid #E2E4E8" }}>
                <td className="py-3" style={{ color: "#431F5D" }}>{client.name}</td>
                <td className="py-3" style={{ color: "#431F5D" }}>{client.playbookVersion}</td>
                <td className="py-3" style={{ color: "#431F5D" }}>{client.lastUpdated}</td>
                <td className="py-3" style={{ color: "#431F5D" }}>{client.submissions}</td>
                <td className="py-3" style={{ color: "#431F5D" }}>{client.escalations}</td>
                <td className="py-3"><StatusBadge status={client.status} /></td>
                <td className="py-3">
                  <button
                    onClick={() => onUpdateClick(client.id)}
                    className="px-3 py-1 rounded text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: "1px solid #431F5D", color: "#431F5D" }}
                  >
                    Update playbook
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <div 
            key={client.id} 
            className="p-3 rounded-lg"
            style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>{client.name}</span>
              <StatusBadge status={client.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ color: "#4A4A6A" }}>
              <div>Version: {client.playbookVersion}</div>
              <div>Updated: {client.lastUpdated}</div>
              <div>Submissions: {client.submissions}</div>
              <div>Escalations: {client.escalations}</div>
            </div>
            <button
              onClick={() => onUpdateClick(client.id)}
              className="w-full px-3 py-1.5 rounded text-xs font-medium"
              style={{ border: "1px solid #431F5D", color: "#431F5D" }}
            >
              Update playbook
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 flex flex-wrap gap-4" style={{ borderTop: "1px solid #E2E4E8" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#E8F5E9" }} />
          <span className="text-xs" style={{ color: "#4A4A6A" }}>Healthy — no action needed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFF3E0" }} />
          <span className="text-xs" style={{ color: "#4A4A6A" }}>Review recommended — escalations detected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFEBEE" }} />
          <span className="text-xs" style={{ color: "#4A4A6A" }}>Review overdue — high activity since last update</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PANEL 2: PLAYBOOK MANAGEMENT
// ─────────────────────────────────────────────

function PlaybookManagementPanel({ 
  clients,
  selectedClientId,
  onClientChange,
  panelRef
}: { 
  clients: Client[]
  selectedClientId: string
  onClientChange: (id: string) => void
  panelRef: React.RefObject<HTMLDivElement | null>
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentVersion, setCurrentVersion] = useState("v2.1")
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [rollbackConfirm, setRollbackConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0]

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".docx")) {
      setUploadedFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".docx")) {
      setUploadedFile(file)
    }
  }

  const handleProcessPlaybook = () => {
    setShowDiff(true)
  }

  const handleApplyUpdate = () => {
    setShowDiff(false)
    setShowSuccess(true)
    setUploadedFile(null)
    setCurrentVersion("v2.2")
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleDiscard = () => {
    setShowDiff(false)
    setUploadedFile(null)
  }

  const handleRollback = (version: string) => {
    setCurrentVersion(version)
    setRollbackConfirm(null)
  }

  return (
    <div 
      ref={panelRef}
      className="bg-white rounded-lg p-4 sm:p-6" 
      style={{ border: "1px solid #E2E4E8" }}
    >
      <h2 className="font-medium mb-4" style={{ fontSize: "16px", color: "#431F5D" }}>
        Playbook management
      </h2>

      {/* Client Selector */}
      <div className="mb-4">
        <label className="block text-xs mb-1" style={{ color: "#4A4A6A" }}>Select client</label>
        <select
          value={selectedClientId}
          onChange={(e) => onClientChange(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-md text-sm"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D", backgroundColor: "#FFFFFF" }}
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Current Playbook Card */}
      <div 
        className="p-4 rounded-lg mb-4"
        style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h3 className="font-medium" style={{ fontSize: "14px", color: "#431F5D" }}>
            {selectedClient.name}
          </h3>
          <StatusBadge status={selectedClient.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" style={{ color: "#4A4A6A" }}>
          <div>Version: <span style={{ color: "#431F5D" }}>{currentVersion}</span></div>
          <div>Effective: <span style={{ color: "#431F5D" }}>{selectedClient.effectiveDate}</span></div>
          <div className="col-span-2">Last updated by: <span style={{ color: "#431F5D" }}>{selectedClient.lastUpdatedBy}</span></div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div 
          className="p-3 rounded-md mb-4"
          style={{ backgroundColor: "#E8F5E9", color: "#1B5E20", fontSize: "13px" }}
        >
          Playbook updated. Version {currentVersion} is now live.
        </div>
      )}

      {/* Upload Section */}
      {!showDiff && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: "#431F5D" }}>
            Upload updated playbook
          </label>
          <p className="text-xs mb-3" style={{ color: "#4A4A6A" }}>
            Upload a .docx file. The platform will extract all clause positions and show you a diff before applying any changes.
          </p>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            className="p-6 rounded-lg text-center cursor-pointer transition-colors"
            style={{ 
              border: `2px dashed ${isDragging ? "#FB6A1B" : "#E2E4E8"}`,
              backgroundColor: "#F7F8FA"
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploadedFile ? (
              <div>
                <p className="text-sm font-medium" style={{ color: "#431F5D" }}>{uploadedFile.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleProcessPlaybook() }}
                  className="mt-3 px-4 py-2 rounded-md text-sm font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
                >
                  Process playbook
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm" style={{ color: "#431F5D" }}>Drop playbook.docx here, or click to browse</p>
                <p className="text-xs mt-1" style={{ color: "#4A4A6A" }}>.docx only</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Diff View */}
      {showDiff && (
        <div className="mb-4">
          <h3 className="font-medium mb-1" style={{ fontSize: "14px", color: "#431F5D" }}>
            Review changes before applying
          </h3>
          <p className="text-xs mb-3" style={{ color: "#4A4A6A" }}>
            The following positions will change. This cannot be undone — the previous version will be archived.
          </p>

          {/* Diff Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E4E8" }}>
                  <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Clause</th>
                  <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Field changed</th>
                  <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Previous value</th>
                  <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>New value</th>
                  <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Severity change</th>
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row, i) => (
                  <tr 
                    key={i} 
                    style={{ 
                      borderBottom: "1px solid #E2E4E8",
                      backgroundColor: row.isEscalation ? "#FFF3E0" : "transparent"
                    }}
                  >
                    <td className="py-2" style={{ color: "#431F5D" }}>{row.clause}</td>
                    <td className="py-2" style={{ color: "#431F5D" }}>{row.field}</td>
                    <td className="py-2" style={{ color: "#431F5D" }}>{row.oldValue}</td>
                    <td className="py-2" style={{ color: "#431F5D" }}>{row.newValue}</td>
                    <td className="py-2" style={{ color: row.isEscalation ? "#E65100" : "#431F5D", fontWeight: row.isEscalation ? 500 : 400 }}>
                      {row.severityChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Diff Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyUpdate}
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
            >
              Apply update
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{ border: "1px solid #431F5D", color: "#431F5D" }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Version History */}
      <div style={{ borderTop: "1px solid #E2E4E8", paddingTop: "16px" }}>
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: "#431F5D" }}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            style={{ transform: historyExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          Version history ({versionHistory.length} versions)
        </button>

        {historyExpanded && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody>
                {versionHistory.map((v) => (
                  <tr key={v.version} style={{ borderBottom: "1px solid #E2E4E8" }}>
                    <td className="py-2" style={{ color: "#431F5D" }}>{v.version}</td>
                    <td className="py-2" style={{ color: "#431F5D" }}>{v.date}</td>
                    <td className="py-2" style={{ color: "#4A4A6A" }}>
                      {v.isInitial ? "Initial version" : `Updated by ${v.updatedBy}`}
                    </td>
                    <td className="py-2">
                      {rollbackConfirm === v.version ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: "#4A4A6A" }}>Are you sure? This will revert to {v.version}.</span>
                          <button 
                            onClick={() => handleRollback(v.version)}
                            className="text-xs font-medium"
                            style={{ color: "#431F5D" }}
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setRollbackConfirm(null)}
                            className="text-xs"
                            style={{ color: "#4A4A6A" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRollbackConfirm(v.version)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ border: "1px solid #431F5D", color: "#431F5D" }}
                        >
                          Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PANEL 3: SUBMISSION LOG AND METRICS
// ─────────────────────────────────────────────

function SubmissionLogPanel() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    client: "all",
    flow: "all",
    status: "all",
    dateFrom: "",
    dateTo: ""
  })

  const handleExport = () => {
    const csv = [
      "ID,Date,User,Client,Flow,Output State,Escalation,Turnaround",
      "PKT-001,12 May 2026 14:32,John Doe,TECHNIA,Review,Minor approved,No,1m 42s",
      "PKT-002,12 May 2026 11:15,Sarah Chen,Ayvens,Review,Major flagged,Yes,3m 18s",
      "PKT-003,11 May 2026 09:44,Ravi Mehta,Kulfi Collective,Generate,Clean,No,0m 58s",
      "PKT-004,10 May 2026 16:20,John Doe,TECHNIA,Review,Sign as is,No,1m 12s",
      "PKT-005,09 May 2026 10:05,Sarah Chen,Ayvens,Generate,Clean,No,1m 03s"
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Pact_submissions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6" style={{ border: "1px solid #E2E4E8" }}>
      <h2 className="font-medium mb-4" style={{ fontSize: "16px", color: "#431F5D" }}>
        Submission log
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          className="px-3 py-1.5 rounded text-xs"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
        >
          <option value="all">All clients</option>
          <option value="technia">TECHNIA</option>
          <option value="ayvens">Ayvens</option>
          <option value="kulfi">Kulfi Collective</option>
        </select>
        <select
          value={filters.flow}
          onChange={(e) => setFilters({ ...filters, flow: e.target.value })}
          className="px-3 py-1.5 rounded text-xs"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
        >
          <option value="all">All flows</option>
          <option value="generate">Generate</option>
          <option value="review">Review</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 rounded text-xs"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
        >
          <option value="all">All statuses</option>
          <option value="escalated">Escalated</option>
          <option value="major">Major deviation</option>
          <option value="clean">Clean</option>
        </select>
        <input
          type="text"
          placeholder="From"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-1.5 rounded text-xs w-24"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
        />
        <input
          type="text"
          placeholder="To"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="px-3 py-1.5 rounded text-xs w-24"
          style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
        />
        <button
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{ border: "1px solid #431F5D", color: "#431F5D" }}
        >
          Apply filters
        </button>
      </div>

      {/* Export Button */}
      <div className="mb-3">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{ border: "1px solid #431F5D", color: "#431F5D" }}
        >
          Export as CSV
        </button>
      </div>

      {/* Submission Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E4E8" }}>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>ID</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Date</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>User</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Client</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Flow</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Output state</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Escalation</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Turnaround</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <>
                <tr 
                  key={sub.id} 
                  style={{ 
                    borderBottom: expandedRow === sub.id ? "none" : "1px solid #E2E4E8",
                    backgroundColor: sub.escalation ? "#FFF8F8" : "transparent"
                  }}
                >
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.id}</td>
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.date}</td>
                  <td className="py-2" style={{ color: "#431F5D" }}>
                    {sub.user}<br/>
                    <span style={{ color: "#4A4A6A" }}>{sub.email}</span>
                  </td>
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.client}</td>
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.flow}</td>
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.outputState}</td>
                  <td className="py-2" style={{ color: sub.escalation ? "#B71C1C" : "#431F5D" }}>
                    {sub.escalation ? "Yes" : "No"}
                  </td>
                  <td className="py-2" style={{ color: "#431F5D" }}>{sub.turnaround}</td>
                  <td className="py-2">
                    <button
                      onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                      className="text-xs font-medium underline"
                      style={{ color: "#431F5D" }}
                    >
                      {expandedRow === sub.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {expandedRow === sub.id && sub.deviationLog && (
                  <tr key={`${sub.id}-expanded`}>
                    <td colSpan={9} style={{ backgroundColor: "#F7F8FA", padding: "12px" }}>
                      <p className="text-xs font-medium mb-2" style={{ color: "#431F5D" }}>
                        Deviation log for {sub.id}
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left pb-1 font-medium" style={{ color: "#4A4A6A" }}>Clause</th>
                            <th className="text-left pb-1 font-medium" style={{ color: "#4A4A6A" }}>Severity</th>
                            <th className="text-left pb-1 font-medium" style={{ color: "#4A4A6A" }}>Decision</th>
                            <th className="text-left pb-1 font-medium" style={{ color: "#4A4A6A" }}>User</th>
                            <th className="text-left pb-1 font-medium" style={{ color: "#4A4A6A" }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.deviationLog.map((log, i) => (
                            <tr key={i}>
                              <td className="py-1" style={{ color: "#431F5D" }}>{log.clause}</td>
                              <td className="py-1" style={{ color: "#431F5D" }}>{log.severity}</td>
                              <td className="py-1" style={{ color: log.decision === "Accepted" ? "#1B5E20" : "#B71C1C" }}>
                                {log.decision}
                              </td>
                              <td className="py-1" style={{ color: "#431F5D" }}>{log.user}</td>
                              <td className="py-1" style={{ color: "#431F5D" }}>{log.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submission Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {submissions.map((sub) => (
          <div 
            key={sub.id}
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: sub.escalation ? "#FFF8F8" : "#F7F8FA", 
              border: "1px solid #E2E4E8" 
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-xs" style={{ color: "#431F5D" }}>{sub.id}</span>
              <span className="text-xs" style={{ color: "#4A4A6A" }}>{sub.date}</span>
            </div>
            <div className="text-xs space-y-1" style={{ color: "#4A4A6A" }}>
              <div>{sub.user} ({sub.email})</div>
              <div>Client: {sub.client} | Flow: {sub.flow}</div>
              <div>Output: {sub.outputState}</div>
              <div>
                Escalation: <span style={{ color: sub.escalation ? "#B71C1C" : "#431F5D" }}>{sub.escalation ? "Yes" : "No"}</span>
                {" | "}Turnaround: {sub.turnaround}
              </div>
            </div>
            {sub.deviationLog && (
              <button
                onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                className="mt-2 text-xs font-medium underline"
                style={{ color: "#431F5D" }}
              >
                {expandedRow === sub.id ? "Hide details" : "View details"}
              </button>
            )}
            {expandedRow === sub.id && sub.deviationLog && (
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid #E2E4E8" }}>
                {sub.deviationLog.map((log, i) => (
                  <div key={i} className="text-xs py-1" style={{ color: "#431F5D" }}>
                    {log.clause}: <span style={{ color: log.decision === "Accepted" ? "#1B5E20" : "#B71C1C" }}>{log.decision}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#F3EEF7" }}>
          <p className="text-lg font-medium" style={{ color: "#431F5D" }}>5</p>
          <p className="text-xs" style={{ color: "#4A4A6A" }}>Total submissions</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#FFEBEE" }}>
          <p className="text-lg font-medium" style={{ color: "#B71C1C" }}>20%</p>
          <p className="text-xs" style={{ color: "#4A4A6A" }}>Escalation rate</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#F3EEF7" }}>
          <p className="text-lg font-medium" style={{ color: "#431F5D" }}>1m 39s</p>
          <p className="text-xs" style={{ color: "#4A4A6A" }}>Avg. turnaround</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#E8F5E9" }}>
          <p className="text-lg font-medium" style={{ color: "#1B5E20" }}>4.2 / 5</p>
          <p className="text-xs" style={{ color: "#4A4A6A" }}>Avg. satisfaction</p>
        </div>
      </div>

      {/* Queue Health */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: "#4A4A6A" }}>
        <span>Queue depth: 0 jobs</span>
        <span>Avg. processing time (last hour): 1m 44s</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PANEL 4: DOMAIN AND USER MANAGEMENT
// ─────────────────────────────────────────────

function ClientAccessPanel({ clients }: { clients: Client[] }) {
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [newDomain, setNewDomain] = useState({ domain: "", clientName: "", playbook: "v2.1" })
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null)
  const [userDeactivateConfirm, setUserDeactivateConfirm] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6" style={{ border: "1px solid #E2E4E8" }}>
      <h2 className="font-medium mb-4" style={{ fontSize: "16px", color: "#431F5D" }}>
        Client access
      </h2>

      {/* Add Domain Button */}
      <button
        onClick={() => setShowAddDomain(!showAddDomain)}
        className="px-4 py-2 rounded-md text-sm font-medium text-white mb-4"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
      >
        Add domain
      </button>

      {/* Add Domain Form */}
      {showAddDomain && (
        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Email domain"
              value={newDomain.domain}
              onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
              className="px-3 py-2 rounded text-xs"
              style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
            />
            <input
              type="text"
              placeholder="Client display name"
              value={newDomain.clientName}
              onChange={(e) => setNewDomain({ ...newDomain, clientName: e.target.value })}
              className="px-3 py-2 rounded text-xs"
              style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
            />
            <select
              value={newDomain.playbook}
              onChange={(e) => setNewDomain({ ...newDomain, playbook: e.target.value })}
              className="px-3 py-2 rounded text-xs"
              style={{ border: "1px solid #E2E4E8", color: "#431F5D" }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.playbookVersion}>{c.name} - {c.playbookVersion}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddDomain(false)}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{ border: "1px solid #431F5D", color: "#431F5D" }}
          >
            Register
          </button>
        </div>
      )}

      {/* Domain Table - Desktop */}
      <div className="hidden md:block overflow-x-auto mb-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E4E8" }}>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Email domain</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Client name</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Playbook</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Status</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Added</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.domain} style={{ borderBottom: "1px solid #E2E4E8" }}>
                <td className="py-2" style={{ color: "#431F5D" }}>{d.domain}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{d.clientName}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{d.playbook}</td>
                <td className="py-2"><ActiveBadge /></td>
                <td className="py-2" style={{ color: "#431F5D" }}>{d.added}</td>
                <td className="py-2">
                  {deactivateConfirm === d.domain ? (
                    <div className="flex items-center gap-2">
                      <button className="text-xs font-medium" style={{ color: "#B71C1C" }}>Confirm</button>
                      <button onClick={() => setDeactivateConfirm(null)} className="text-xs" style={{ color: "#4A4A6A" }}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeactivateConfirm(d.domain)}
                      className="text-xs underline"
                      style={{ color: "#431F5D" }}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Domain Cards - Mobile */}
      <div className="md:hidden space-y-3 mb-6">
        {domains.map((d) => (
          <div key={d.domain} className="p-3 rounded-lg" style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-xs" style={{ color: "#431F5D" }}>{d.domain}</span>
              <ActiveBadge />
            </div>
            <div className="text-xs space-y-1" style={{ color: "#4A4A6A" }}>
              <div>Client: {d.clientName}</div>
              <div>Playbook: {d.playbook} | Added: {d.added}</div>
            </div>
            <button className="mt-2 text-xs underline" style={{ color: "#431F5D" }}>Deactivate</button>
          </div>
        ))}
      </div>

      {/* User Management Table - Desktop */}
      <h3 className="font-medium mb-3" style={{ fontSize: "14px", color: "#431F5D" }}>User management</h3>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E4E8" }}>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Name</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Email</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Client</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>First login</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Last login</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Status</th>
              <th className="pb-2 font-medium" style={{ color: "#4A4A6A" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} style={{ borderBottom: "1px solid #E2E4E8" }}>
                <td className="py-2" style={{ color: "#431F5D" }}>{u.name}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{u.email}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{u.client}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{u.firstLogin}</td>
                <td className="py-2" style={{ color: "#431F5D" }}>{u.lastLogin}</td>
                <td className="py-2"><ActiveBadge /></td>
                <td className="py-2">
                  {userDeactivateConfirm === u.email ? (
                    <div className="space-y-1">
                      <p className="text-xs" style={{ color: "#4A4A6A" }}>
                        Deactivate {u.name}? They will no longer be able to log in. Their submission history will be preserved.
                      </p>
                      <div className="flex gap-2">
                        <button className="text-xs font-medium" style={{ color: "#B71C1C" }}>Confirm</button>
                        <button onClick={() => setUserDeactivateConfirm(null)} className="text-xs" style={{ color: "#4A4A6A" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setUserDeactivateConfirm(u.email)}
                      className="text-xs underline"
                      style={{ color: "#431F5D" }}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.email} className="p-3 rounded-lg" style={{ backgroundColor: "#F7F8FA", border: "1px solid #E2E4E8" }}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-xs" style={{ color: "#431F5D" }}>{u.name}</span>
              <ActiveBadge />
            </div>
            <div className="text-xs space-y-1" style={{ color: "#4A4A6A" }}>
              <div>{u.email}</div>
              <div>Client: {u.client}</div>
              <div>First: {u.firstLogin} | Last: {u.lastLogin}</div>
            </div>
            <button className="mt-2 text-xs underline" style={{ color: "#431F5D" }}>Deactivate</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function AdminPage() {
  const [clients, setClients] = useState(initialClients)
  const [selectedClientId, setSelectedClientId] = useState("technia")
  const playbookPanelRef = useRef<HTMLDivElement>(null)

  const handleUpdateClick = (clientId: string) => {
    setSelectedClientId(clientId)
    playbookPanelRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-medium" style={{ fontSize: "22px", color: "#431F5D" }}>
            Admin
          </h1>
          <p className="italic" style={{ fontSize: "13px", color: "#4A4A6A" }}>
            Counselect internal — not visible to clients
          </p>
        </div>

        {/* Panels */}
        <div className="space-y-6">
          <PlaybookHealthPanel 
            clients={clients} 
            onUpdateClick={handleUpdateClick} 
          />
          
          <PlaybookManagementPanel 
            clients={clients}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            panelRef={playbookPanelRef}
          />
          
          <SubmissionLogPanel />
          
          <ClientAccessPanel clients={clients} />
        </div>
      </div>
    </main>
  )
}
