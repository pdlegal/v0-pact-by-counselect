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
          className="mx-auto p-6 rounded-lg"
          style={{ maxWidth: "560px", backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          <h1 className="font-medium text-center" style={{ fontSize: "20px", color: "#431F5D" }}>
            Your NDA is ready
          </h1>

          <p className="text-center mt-2" style={{ fontSize: "13px", color: "#4A4A6A" }}>
            Drafted to {formData?.technia_entity || "your"} standard · Mutual NDA
          </p>

          <div className="flex gap-3 mt-6 justify-center">
            <div className="px-4 py-2 rounded-md text-center" style={{ backgroundColor: "#F3EEF7" }}>
              <span className="text-xs font-medium" style={{ color: "#431F5D" }}>Mutual NDA</span>
            </div>
            <div className="px-4 py-2 rounded-md text-center" style={{ backgroundColor: "#F3EEF7" }}>
              <span className="text-xs font-medium" style={{ color: "#431F5D" }}>
                {formData?.duration || "Custom term"}
              </span>
            </div>
            <div className="px-4 py-2 rounded-md text-center" style={{ backgroundColor: "#F3EEF7" }}>
              <span className="text-xs font-medium" style={{ color: "#431F5D" }}>Sweden law</span>
            </div>
          </div>

          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          <button
            onClick={handleDownloadDocx}
            disabled={!docxBase64}
            className="w-full font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              color: "#FFFFFF",
              borderRadius: "6px",
              padding: "13px",
              fontSize: "14px"
            }}
          >
            {docxBase64 ? "Download NDA (.docx)" : "Preparing your NDA..."}
          </button>

          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          <p className="text-center" style={{ fontSize: "11px", color: "#4A4A6A", lineHeight: 1.6 }}>
            This NDA has been drafted to your standard positions. Review it before sending to your counterparty.
          </p>

          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          <StarRating />

          <div className="my-6" style={{ height: "0.5px", backgroundColor: "#E2E4E8" }} />

          <div className="text-center">
            <Link href="/home" className="underline transition-opacity hover:opacity-80"
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
