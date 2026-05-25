"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type TabType = "active" | "completed"

interface ActiveSubmission {
  id: string
  counterparty: string
  date: string
  status: "in_progress" | "awaiting_approval"
  statusText: string
}

interface CompletedSubmission {
  id: string
  counterparty: string
  date: string
  statusText: string
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const activeSubmissions: ActiveSubmission[] = [
  {
    id: "PKT-006",
    counterparty: "Acme Corp",
    date: "21 May 2026",
    status: "in_progress",
    statusText: "In progress — 3 of 5 deviations actioned"
  },
  {
    id: "PKT-007",
    counterparty: "Beta Ltd",
    date: "20 May 2026",
    status: "awaiting_approval",
    statusText: "Awaiting approval — approval email sent"
  }
]

const completedSubmissions: CompletedSubmission[] = [
  {
    id: "PKT-001",
    counterparty: "Technia AB",
    date: "12 May 2026",
    statusText: "Complete — Minor deviations approved"
  },
  {
    id: "PKT-003",
    counterparty: "Kulfi Collective",
    date: "11 May 2026",
    statusText: "Complete — Sign as is"
  }
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

function TabButton({ 
  label, 
  isSelected, 
  onClick 
}: { 
  label: string
  isSelected: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
      style={{
        backgroundColor: isSelected ? "#431F5D" : "#F7F8FA",
        color: isSelected ? "#FFFFFF" : "#431F5D",
        border: "0.5px solid #E2E4E8"
      }}
    >
      {label}
    </button>
  )
}

function ActiveSubmissionRow({ submission }: { submission: ActiveSubmission }) {
  const router = useRouter()
  const isAwaitingApproval = submission.status === "awaiting_approval"
  
  return (
    <div 
      className="p-4 rounded-lg mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>
            {submission.id}
          </span>
          <span style={{ color: "#4A4A6A", fontSize: "14px" }}>
            {submission.counterparty}
          </span>
          <span style={{ color: "#9B9B9B", fontSize: "13px" }}>
            {submission.date}
          </span>
        </div>
        
        {/* Status Label */}
        {isAwaitingApproval ? (
          <span 
            className="inline-block px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
          >
            {submission.statusText}
          </span>
        ) : (
          <span style={{ color: "#4A4A6A", fontSize: "13px" }}>
            {submission.statusText}
          </span>
        )}
      </div>
      
      {/* Continue Button */}
      <button
        onClick={() => router.push("/review/results")}
        className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
        style={isAwaitingApproval ? {
          backgroundColor: "transparent",
          color: "#431F5D",
          border: "1px solid #431F5D"
        } : {
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
          color: "#FFFFFF"
        }}
      >
        Continue
      </button>
    </div>
  )
}

function CompletedSubmissionRow({ submission }: { submission: CompletedSubmission }) {
  const router = useRouter()
  
  return (
    <div 
      className="p-4 rounded-lg mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-medium" style={{ color: "#431F5D", fontSize: "14px" }}>
            {submission.id}
          </span>
          <span style={{ color: "#4A4A6A", fontSize: "14px" }}>
            {submission.counterparty}
          </span>
          <span style={{ color: "#9B9B9B", fontSize: "13px" }}>
            {submission.date}
          </span>
        </div>
        
        {/* Status Label - Complete badge */}
        <span 
          className="inline-block px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: "#E8F5E9", color: "#1B5E20" }}
        >
          {submission.statusText}
        </span>
      </div>
      
      {/* Download Again Button */}
      <button
        onClick={() => router.push("/review/output")}
        className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "transparent",
          color: "#431F5D",
          border: "1px solid #431F5D"
        }}
      >
        Download again
      </button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div 
      className="p-8 rounded-lg text-center"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
    >
      <p style={{ color: "#4A4A6A", fontSize: "14px" }}>{message}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function PendingRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("active")

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-semibold mb-1" style={{ fontSize: "24px", color: "#431F5D" }}>
              My Requests
            </h1>
            <p style={{ fontSize: "14px", color: "#4A4A6A" }}>
              Track your NDA submissions
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton 
            label="Active" 
            isSelected={activeTab === "active"} 
            onClick={() => setActiveTab("active")} 
          />
          <TabButton 
            label="Completed" 
            isSelected={activeTab === "completed"} 
            onClick={() => setActiveTab("completed")} 
          />
        </div>

        {/* Active Tab Content */}
        {activeTab === "active" && (
          <div>
            {activeSubmissions.length > 0 ? (
              activeSubmissions.map((submission) => (
                <ActiveSubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <EmptyState message="No active NDA reviews. Submit one from the homepage." />
            )}
          </div>
        )}

        {/* Completed Tab Content */}
        {activeTab === "completed" && (
          <div>
            {completedSubmissions.length > 0 ? (
              completedSubmissions.map((submission) => (
                <CompletedSubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <EmptyState message="No completed reviews yet." />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
