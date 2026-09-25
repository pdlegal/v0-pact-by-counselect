"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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

function NavBar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#431F5D" }}>
      <Link href="/home"><PactWordmark /></Link>
      <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.65)" }}>
        Prajoy · <Link href="/" className="hover:underline">Log out</Link>
      </span>
    </nav>
  )
}

function StarRating() {
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  return (
    <div className="text-center">
      {rating === null ? (
        <>
          <p style={{ fontSize: "13px", color: "#431F5D" }}>How was your experience with Pact?</p>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24"
                  fill={(hoveredRating !== null && star <= hoveredRating) ? "#FB6A1B" : "#E2E4E8"}
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p style={{ fontSize: "12px", color: "#4A4A6A" }}>Thank you for your feedback.</p>
      )}
    </div>
  )
}

function NDAPreviewCard({ formData }: { formData: Record<string, string> }) {
  return (
    <div
      className="rounded-xl overflow-hidden mb-6"
      style={{
        border: "1px solid #E2E4E8",
        borderLeft: "3px solid #431F5D"
      }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: "#F3EEF7", borderBottom: "1px solid #E8E0F0" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#431F5D" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-medium" style={{ fontSize: "13px", color: "#431F5D" }}>
            Mutual Non-Disclosure Agreement
          </p>
          <p style={{ fontSize: "11px", color: "#865596" }}>
            Drafted to {formData.technia_entity || "TECHNIA"}'s standard
          </p>
        </div>
        <div
          className="ml-auto px-2 py-1 rounded-full"
          style={{ backgroundColor: "#E8F5E9" }}
        >
          <span style={{ fontSize: "11px", color: "#1B5E20", fontWeight: 500 }}>Ready to send</span>
        </div>
      </div>

      {/* Parties */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid #F0F0F0" }}
      >
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>TECHNIA entity</p>
          <p className="font-medium truncate" style={{ fontSize: "13px", color: "#431F5D" }}>
            {formData.technia_entity || "—"}
          </p>
          <p style={{ fontSize: "11px", color: "#9B9B9B" }}>
            {formData.technia_entity_country || "—"}
          </p>
        </div>

        {/* vs divider */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#F3EEF7" }}
        >
          <span style={{ fontSize: "10px", color: "#431F5D", fontWeight: 600 }}>↔</span>
        </div>

        <div className="flex-1 min-w-0 text-right">
          <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>Counterparty</p>
          <p className="font-medium truncate" style={{ fontSize: "13px", color: "#431F5D" }}>
            {formData.counterparty_name || "—"}
          </p>
          <p style={{ fontSize: "11px", color: "#9B9B9B" }}>
            {formData.counterparty_address || "—"}
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid #F0F0F0" }}
      >
        <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "4px" }}>Purpose</p>
        <p style={{ fontSize: "12px", color: "#4A4A6A", lineHeight: 1.5 }}>
          {formData.purpose || "—"}
        </p>
      </div>

      {/* Key terms strip */}
      <div className="grid grid-cols-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
        <div className="px-5 py-3" style={{ borderRight: "1px solid #F0F0F0" }}>
          <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>Term</p>
          <p className="font-medium" style={{ fontSize: "12px", color: "#431F5D" }}>
            {formData.duration || "—"}
          </p>
        </div>
        <div className="px-5 py-3" style={{ borderRight: "1px solid #F0F0F0" }}>
          <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>Governing law</p>
          <p className="font-medium" style={{ fontSize: "12px", color: "#431F5D" }}>
            {formData.governing_law || "—"}
          </p>
        </div>
        <div className="px-5 py-3">
          <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>Effective date</p>
          <p className="font-medium" style={{ fontSize: "12px", color: "#431F5D" }}>
            {formData.effective_date || "—"}
          </p>
        </div>
      </div>

      {/* Signatory */}
      <div className="px-5 py-3" style={{ backgroundColor: "#FAFAFA" }}>
        <p style={{ fontSize: "11px", color: "#9B9B9B", marginBottom: "2px" }}>Signing for TECHNIA</p>
        <p style={{ fontSize: "12px", color: "#431F5D" }}>
          {formData.signatory_name
            ? `${formData.signatory_name} · ${formData.signatory_title || ""}`
            : "—"}
        </p>
      </div>
    </div>
  )
}

export default function GenerateOutputPage() {
  const [docxBase64, setDocxBase64] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    const base64 = sessionStorage.getItem("generatedDocx")
    const raw = sessionStorage.getItem("generateFormData")
    if (base64) setDocxBase64(base64)
    if (raw) setFormData(JSON.parse(raw))
  }, [])

  const handleDownloadDocx = () => {
    if (!docxBase64) return
    const byteCharacters = atob(docxBase64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData?.counterparty_name || "NDA"}_MNDA.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />

      <div className="px-4 py-8">
        <div
          className="mx-auto"
          style={{ maxWidth: "580px" }}
        >
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="font-medium" style={{ fontSize: "20px", color: "#431F5D" }}>
              Your NDA is ready
            </h1>
            <p style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "4px" }}>
              Check the details below before downloading.
            </p>
          </div>

          {/* Preview card */}
          {formData && <NDAPreviewCard formData={formData} />}

          {/* Download section */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
          >
            <p
              className="text-center font-medium mb-4"
              style={{ fontSize: "13px", color: "#431F5D" }}
            >
              Looks right? Download your NDA.
            </p>

            <button
              onClick={handleDownloadDocx}
              disabled={!docxBase64}
              className="w-full font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                color: "#FFFFFF",
                borderRadius: "6px",
                padding: "13px",
                fontSize: "14px",
                cursor: docxBase64 ? "pointer" : "not-allowed"
              }}
            >
              {docxBase64 ? "Download NDA (.docx)" : "Preparing your NDA..."}
            </button>

            <p
              className="text-center mt-4"
              style={{ fontSize: "11px", color: "#9B9B9B", lineHeight: 1.6 }}
            >
              Review before sending to your counterparty.
            </p>
          </div>

          {/* Divider */}
          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          {/* Star rating */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
          >
            <StarRating />
          </div>

          {/* Divider */}
          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          <div className="text-center">
            <Link
              href="/home"
              className="underline transition-opacity hover:opacity-80"
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
