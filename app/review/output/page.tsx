"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type OutputState = "clean" | "minor" | "major" | "escalation"

function PactWordmark() {
  return (
    <div className="flex items-baseline">
      <span 
        className="font-medium text-xl"
        style={{ color: "#FFFFFF" }}
      >
        Pact
      </span>
      <span
        className="inline-block rounded-full ml-0.5"
        style={{ 
          background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
          width: "6px",
          height: "6px"
        }}
      />
    </div>
  )
}

function NavBar({ userName }: { userName: string }) {
  return (
    <nav 
      className="flex items-center justify-between px-4 py-3"
      style={{ backgroundColor: "#431F5D" }}
    >
      <Link href="/home">
        <PactWordmark />
      </Link>
      <span 
        className="font-normal"
        style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}
      >
        {userName} · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function StarRating() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleClick = (star: number) => {
    setRating(star)
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p 
        className="font-normal text-center"
        style={{ fontSize: "13px", color: "#431F5D" }}
      >
        How was your experience with Pact?
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-colors"
            disabled={submitted}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={star <= (hoveredRating || rating) ? "#FB6A1B" : "#E2E4E8"}
              className="transition-colors"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {submitted && (
        <p 
          className="font-normal"
          style={{ fontSize: "12px", color: "#4A4A6A" }}
        >
          Thank you for your feedback.
        </p>
      )}
    </div>
  )
}

function getStateConfig(state: OutputState, clientName: string) {
  switch (state) {
    case "clean":
      return {
        heading: "Ready to send",
        subheading: `Reviewed against ${clientName}'s NDA playbook · No changes required`,
        downloadLabel: "Download NDA (.docx)",
        showWarningBanner: false,
        showEscalationPanel: false,
        canSendExternally: true,
        smallPrint: `This NDA matches ${clientName}'s standard positions. No changes were required. You can send it directly to the counterparty.`
      }
    case "minor":
      return {
        heading: "Ready to send",
        subheading: `Reviewed against ${clientName}'s NDA playbook · Minor deviations approved`,
        downloadLabel: "Download reviewed NDA (.docx)",
        showWarningBanner: false,
        showEscalationPanel: false,
        canSendExternally: true,
        smallPrint: `Changes reflect ${clientName}'s agreed NDA positions. This version is ready to send to the counterparty.`
      }
    case "major":
      return {
        heading: "For internal review only",
        subheading: `Reviewed against ${clientName}'s NDA playbook · Major deviations present`,
        downloadLabel: "Download reviewed NDA (.docx)",
        showWarningBanner: true,
        showEscalationPanel: false,
        canSendExternally: false,
        smallPrint: `Changes reflect ${clientName}'s agreed NDA positions. Items marked Your decision require approval from your team before the NDA is sent.`
      }
    case "escalation":
      return {
        heading: "For internal review only",
        subheading: `Reviewed against ${clientName}'s NDA playbook · Awaiting legal review`,
        downloadLabel: "Download interim NDA (.docx)",
        showWarningBanner: false,
        showEscalationPanel: true,
        canSendExternally: false,
        smallPrint: `This document is for internal review only. Do not send this version to the counterparty. Your Counselect attorney will provide an external-ready version within 4 business hours.`
      }
  }
}

function WarningBanner() {
  return (
    <div 
      className="p-4 rounded-lg mb-6"
      style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFE0B2" }}
    >
      <p 
        className="font-medium mb-1"
        style={{ fontSize: "13px", color: "#E65100" }}
      >
        Internal review required
      </p>
      <p 
        className="font-normal"
        style={{ fontSize: "12px", color: "#E65100", lineHeight: 1.5 }}
      >
        This document contains major deviations. It must be reviewed by legal or your business head before being sent to the counterparty.
      </p>
    </div>
  )
}

function EscalationPanel() {
  return (
    <div 
      className="p-4 rounded-lg mb-6"
      style={{ backgroundColor: "#F3EEF7", border: "1px solid #D1C4E9" }}
    >
      <p 
        className="font-medium mb-1"
        style={{ fontSize: "13px", color: "#431F5D" }}
      >
        One clause needs attorney review
      </p>
      <p 
        className="font-normal"
        style={{ fontSize: "12px", color: "#4A4A6A", lineHeight: 1.5 }}
      >
        Your Counselect attorney has been notified and will respond within 4 business hours with an external-ready version. The interim document below is for internal use only.
      </p>
    </div>
  )
}

function InternalOnlyHeader() {
  return (
    <div 
      className="p-3 rounded-lg mb-6 text-center"
      style={{ backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}
    >
      <p 
        className="font-medium"
        style={{ fontSize: "12px", color: "#B71C1C", letterSpacing: "0.05em" }}
      >
        FOR INTERNAL REVIEW ONLY — NOT FOR EXTERNAL DISTRIBUTION
      </p>
    </div>
  )
}

// Dev-only state switcher — remove before launch
function StateSwitcher({ 
  current, 
  onChange 
}: { 
  current: OutputState
  onChange: (s: OutputState) => void 
}) {
  const states: OutputState[] = ["clean", "minor", "major", "escalation"]
  return (
    <div 
      className="mb-6 p-3 rounded-lg"
      style={{ backgroundColor: "#F7F8FA", border: "1px dashed #E2E4E8" }}
    >
      <p 
        className="text-xs mb-2 font-medium"
        style={{ color: "#9B9B9B" }}
      >
        Dev only — output state preview
      </p>
      <div className="flex gap-2 flex-wrap">
        {states.map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: current === s ? "#431F5D" : "#FFFFFF",
              color: current === s ? "#FFFFFF" : "#431F5D",
              border: "1px solid #431F5D"
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReviewOutputPage() {
  // Will be replaced with session data once auth is wired
  const userName = "Prajoy"
  const clientName = "TECHNIA"

  // Read state from URL — e.g. /review/output?state=major
  const searchParams = useSearchParams()
  const stateParam = searchParams.get("state") as OutputState | null
  const [outputState, setOutputState] = useState<OutputState>(
    stateParam && ["clean", "minor", "major", "escalation"].includes(stateParam)
      ? stateParam
      : "minor"
  )

  const config = getStateConfig(outputState, clientName)
  const showInternalHeader = outputState === "major" || outputState === "escalation"

  const handleDownload = () => {
    // Placeholder — will call real document download API
    console.log("Downloading document for state:", outputState)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar userName={userName} />
      
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div 
          className="w-full max-w-[560px] rounded-lg p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          {/* Dev state switcher */}
          <StateSwitcher current={outputState} onChange={setOutputState} />

          {/* Internal only header for states 3 and 4 */}
          {showInternalHeader && <InternalOnlyHeader />}

          {/* Heading */}
          <h1 
            className="font-medium text-center"
            style={{ fontSize: "20px", color: "#431F5D" }}
          >
            {config.heading}
          </h1>
          
          {/* Subheading */}
          <p 
            className="font-normal text-center mt-2"
            style={{ fontSize: "13px", color: "#4A4A6A" }}
          >
            {config.subheading}
          </p>

          {/* Warning or escalation banners */}
          <div className="mt-6">
            {config.showWarningBanner && <WarningBanner />}
            {config.showEscalationPanel && <EscalationPanel />}
          </div>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              borderRadius: "6px",
              padding: "13px",
              fontSize: "14px"
            }}
          >
            {config.downloadLabel}
          </button>

          {/* Email link */}
          <div className="text-center mt-4">
            <button
              className="font-normal hover:underline"
              style={{ fontSize: "13px", color: "#FB6A1B" }}
            >
              Email this to me
            </button>
          </div>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Small print */}
          <p 
            className="font-normal"
            style={{ 
              fontSize: "11px", 
              color: "#4A4A6A",
              lineHeight: "1.6"
            }}
          >
            {config.smallPrint}
          </p>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Star rating */}
          <StarRating />

          {/* Links */}
          <div className="flex justify-center gap-6 mt-6">
            <Link
              href="/pending"
              className="font-normal underline"
              style={{ fontSize: "13px", color: "#431F5D" }}
            >
              View my requests
            </Link>
            <Link
              href="/home"
              className="font-normal underline"
              style={{ fontSize: "13px", color: "#431F5D" }}
            >
              Submit another NDA
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
