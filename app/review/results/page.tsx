"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

function PactWordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <span 
        className="font-medium text-lg tracking-tight"
        style={{ color: "#FFFFFF" }}
      >
        pact
      </span>
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: "linear-gradient(135deg, #FB6A1B, #D2582F)" }}
      />
    </div>
  )
}

function NavBar() {
  return (
    <nav 
      className="flex items-center justify-between px-4 py-3"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <span 
        className="text-sm"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        Jane Smith
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
  status: DeviationStatus
  declarationChecked?: boolean
}

const initialDeviations: Deviation[] = [
  {
    id: 1,
    type: "minor",
    title: "Survival period",
    counterparty: "5 years from date of disclosure",
    standard: "3 years from date of disclosure",
    reason: "Technia does not accept survival periods exceeding 3 years.",
    status: "pending"
  },
  {
    id: 2,
    type: "minor",
    title: "Governing law",
    counterparty: "Laws of New York",
    standard: "English law, England and Wales",
    reason: "Technia's standard governing law is England and Wales.",
    status: "pending"
  },
  {
    id: 3,
    type: "minor",
    title: "Notice period for return of materials",
    counterparty: "30 days",
    standard: "14 days",
    reason: "Technia's standard return period is 14 days.",
    status: "pending"
  },
  {
    id: 4,
    type: "major",
    title: "Confidentiality obligations",
    counterparty: "Obligations survive indefinitely",
    standard: "Obligations expire at end of survival period",
    reason: "Perpetual confidentiality requires leadership approval.",
    status: "pending",
    declarationChecked: false
  },
  {
    id: 5,
    type: "major",
    title: "Jurisdiction",
    counterparty: "Courts of New York, USA",
    standard: "Courts of England and Wales",
    reason: "New York jurisdiction requires leadership approval.",
    status: "pending",
    declarationChecked: false
  },
  {
    id: 6,
    type: "escalation",
    title: "Residuals clause",
    counterparty: "Requires attorney review",
    standard: "",
    reason: "This clause type is outside Technia's standard playbook. Your Counselect attorney has been notified and will follow up within 4 business hours.",
    status: "pending"
  }
]

function Badge({ type }: { type: "minor" | "major" | "escalation" }) {
  const styles = {
    minor: { bg: "#FFF3E0", color: "#E65100" },
    major: { bg: "#FFEBEE", color: "#B71C1C" },
    escalation: { bg: "#F5F5F5", color: "#4A4A6A" }
  }
  
  const labels = {
    minor: "Minor",
    major: "Major",
    escalation: "Escalation"
  }
  
  return (
    <span
      className="px-2 py-1 text-xs font-medium rounded"
      style={{ backgroundColor: styles[type].bg, color: styles[type].color }}
    >
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
    <span
      className="px-2 py-1 text-xs font-medium rounded"
      style={{ backgroundColor: styles[status].bg, color: styles[status].color }}
    >
      {status === "accepted" ? "Accepted" : "Rejected"}
    </span>
  )
}

function ActionToggle({ 
  status, 
  onAccept, 
  onReject,
  disabled = false 
}: { 
  status: DeviationStatus
  onAccept: () => void
  onReject: () => void
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <div className="flex gap-2 opacity-50">
        <button
          disabled
          className="px-3 py-1.5 text-xs font-medium rounded cursor-not-allowed"
          style={{ backgroundColor: "#E2E4E8", color: "#4A4A6A" }}
        >
          Accept
        </button>
        <button
          disabled
          className="px-3 py-1.5 text-xs font-medium rounded cursor-not-allowed"
          style={{ backgroundColor: "#E2E4E8", color: "#4A4A6A" }}
        >
          Reject
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onAccept}
        className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
        style={{ 
          backgroundColor: status === "accepted" ? "#E8F5E9" : "#FFFFFF",
          color: status === "accepted" ? "#1B5E20" : "#4A4A6A",
          border: "1px solid #E2E4E8"
        }}
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
        style={{ 
          backgroundColor: status === "rejected" ? "#FFEBEE" : "#FFFFFF",
          color: status === "rejected" ? "#B71C1C" : "#4A4A6A",
          border: "1px solid #E2E4E8"
        }}
      >
        Reject
      </button>
    </div>
  )
}

function DeviationCard({ 
  deviation, 
  onStatusChange,
  onDeclarationChange
}: { 
  deviation: Deviation
  onStatusChange: (id: number, status: DeviationStatus) => void
  onDeclarationChange?: (id: number, checked: boolean) => void
}) {
  const isEscalation = deviation.type === "escalation"
  const isMajor = deviation.type === "major"
  const needsDeclaration = isMajor && !deviation.declarationChecked

  return (
    <div 
      className="p-4 rounded-lg mb-3"
      style={{ 
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E4E8",
        borderLeft: isEscalation ? "3px solid #FB6A1B" : "1px solid #E2E4E8"
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="font-medium text-sm"
              style={{ color: "#431F5D" }}
            >
              {deviation.title}
            </span>
            <Badge type={deviation.type} />
            <StatusBadge status={deviation.status} />
          </div>
          
          {!isEscalation && (
            <>
              <div className="mb-2">
                <span className="text-xs" style={{ color: "#4A4A6A" }}>Counterparty: </span>
                <span className="text-xs" style={{ color: "#431F5D" }}>{deviation.counterparty}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs" style={{ color: "#4A4A6A" }}>{"Technia's standard: "}</span>
                <span className="text-xs" style={{ color: "#431F5D" }}>{deviation.standard}</span>
              </div>
            </>
          )}
          
          <p className="text-xs" style={{ color: "#4A4A6A" }}>
            {deviation.reason}
          </p>
          
          {isMajor && (
            <label className="flex items-start gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deviation.declarationChecked || false}
                onChange={(e) => onDeclarationChange?.(deviation.id, e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded"
                style={{ accentColor: "#FB6A1B" }}
              />
              <span className="text-xs" style={{ color: "#4A4A6A" }}>
                I confirm I have received the necessary approval to accept this deviation.
              </span>
            </label>
          )}
        </div>
        
        {!isEscalation && (
          <div className="flex-shrink-0">
            <ActionToggle
              status={deviation.status}
              onAccept={() => onStatusChange(deviation.id, "accepted")}
              onReject={() => onStatusChange(deviation.id, "rejected")}
              disabled={needsDeclaration}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function DeviationTablePage() {
  const [deviations, setDeviations] = useState<Deviation[]>(initialDeviations)

  const handleStatusChange = (id: number, status: DeviationStatus) => {
    setDeviations(prev => 
      prev.map(d => d.id === id ? { ...d, status } : d)
    )
  }

  const handleDeclarationChange = (id: number, checked: boolean) => {
    setDeviations(prev => 
      prev.map(d => d.id === id ? { ...d, declarationChecked: checked } : d)
    )
  }

  const actionableDeviations = deviations.filter(d => d.type !== "escalation")
  const actionedCount = actionableDeviations.filter(d => d.status !== "pending").length
  const totalActionable = actionableDeviations.length
  const allActioned = actionedCount === totalActionable

  const hasMajorAccepted = deviations.some(d => d.type === "major" && d.status === "accepted")

  const minorDeviations = deviations.filter(d => d.type === "minor")
  const majorDeviations = deviations.filter(d => d.type === "major")
  const escalations = deviations.filter(d => d.type === "escalation")

  const summaryStats = useMemo(() => ({
    minor: deviations.filter(d => d.type === "minor").length,
    major: deviations.filter(d => d.type === "major").length,
    escalation: deviations.filter(d => d.type === "escalation").length
  }), [deviations])

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 
          className="font-medium mb-1"
          style={{ color: "#431F5D", fontSize: "20px" }}
        >
          Your NDA has been reviewed
        </h1>
        <p 
          className="mb-6"
          style={{ color: "#4A4A6A", fontSize: "13px" }}
        >
          {"Reviewed against Technia's NDA standards · 6 issues found"}
        </p>

        {/* Summary Badges */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div 
            className="px-3 py-2 rounded-lg text-center"
            style={{ backgroundColor: "#FFF3E0" }}
          >
            <span 
              className="text-sm font-medium"
              style={{ color: "#E65100" }}
            >
              {summaryStats.minor} minor deviations
            </span>
          </div>
          <div 
            className="px-3 py-2 rounded-lg text-center"
            style={{ backgroundColor: "#FFEBEE" }}
          >
            <span 
              className="text-sm font-medium"
              style={{ color: "#B71C1C" }}
            >
              {summaryStats.major} major deviations
            </span>
          </div>
          <div 
            className="px-3 py-2 rounded-lg text-center"
            style={{ backgroundColor: "#F5F5F5" }}
          >
            <span 
              className="text-sm font-medium"
              style={{ color: "#4A4A6A" }}
            >
              {summaryStats.escalation} escalation
            </span>
          </div>
        </div>

        {/* Top-3 Summary */}
        <div 
          className="p-3 rounded-md mb-6"
          style={{ backgroundColor: "#F3EEF7", borderRadius: "6px" }}
        >
          <p 
            className="italic"
            style={{ color: "#4A4A6A", fontSize: "13px" }}
          >
            {"Based on Technia's NDA playbook, the three most significant issues are: (1) Survival period is 5 years — Technia's standard is 3 years. (2) Governing law is New York — Technia prefers English law. (3) Perpetual confidentiality — requires leadership approval."}
          </p>
        </div>

        {/* Progress Indicator */}
        <p 
          className="mb-4"
          style={{ color: "#4A4A6A", fontSize: "12px" }}
        >
          {actionedCount} of {totalActionable} deviations actioned
        </p>

        {/* Minor Deviations Section */}
        <h2 
          className="uppercase mb-3"
          style={{ 
            color: "#4A4A6A", 
            fontSize: "11px", 
            letterSpacing: "0.1em",
            fontWeight: 500
          }}
        >
          Minor Deviations
        </h2>
        {minorDeviations.map(deviation => (
          <DeviationCard
            key={deviation.id}
            deviation={deviation}
            onStatusChange={handleStatusChange}
            onDeclarationChange={handleDeclarationChange}
          />
        ))}

        {/* Major Deviations Section */}
        <h2 
          className="uppercase mb-3 mt-6"
          style={{ 
            color: "#4A4A6A", 
            fontSize: "11px", 
            letterSpacing: "0.1em",
            fontWeight: 500
          }}
        >
          Major Deviations
        </h2>
        {majorDeviations.map(deviation => (
          <DeviationCard
            key={deviation.id}
            deviation={deviation}
            onStatusChange={handleStatusChange}
            onDeclarationChange={handleDeclarationChange}
          />
        ))}

        {/* Escalation Section */}
        <h2 
          className="uppercase mb-3 mt-6"
          style={{ 
            color: "#4A4A6A", 
            fontSize: "11px", 
            letterSpacing: "0.1em",
            fontWeight: 500
          }}
        >
          Escalation
        </h2>
        {escalations.map(deviation => (
          <DeviationCard
            key={deviation.id}
            deviation={deviation}
            onStatusChange={handleStatusChange}
            onDeclarationChange={handleDeclarationChange}
          />
        ))}

        {/* Warning Banner */}
        {hasMajorAccepted && (
          <div 
            className="p-3 rounded-md mb-4 mt-6"
            style={{ backgroundColor: "#FFF3E0", borderRadius: "6px" }}
          >
            <p style={{ color: "#E65100", fontSize: "13px" }}>
              This document contains major deviations. It must be reviewed by legal before being sent to the counterparty.
            </p>
          </div>
        )}

        {/* Download Button */}
        <button
          disabled={!allActioned}
          className="w-full py-3 rounded-md font-medium transition-all mt-4"
          style={{
            background: allActioned 
              ? "linear-gradient(135deg, #FB6A1B, #D2582F)" 
              : "#E2E4E8",
            color: allActioned ? "#FFFFFF" : "#4A4A6A",
            cursor: allActioned ? "pointer" : "not-allowed",
            fontSize: "14px"
          }}
        >
          {allActioned 
            ? "Download reviewed NDA (.docx)" 
            : "Action all deviations to unlock"
          }
        </button>
      </div>
    </main>
  )
}
