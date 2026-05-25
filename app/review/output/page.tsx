"use client"

import { useState } from "react"
import Link from "next/link"

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
        className="font-normal"
        style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}
      >
        Jane Smith
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

// Set to true to demo the escalation state
const ESCALATION_PRESENT = false

export default function ReviewOutputPage() {
  const [attorneyNotified, setAttorneyNotified] = useState(false)
  const escalation = ESCALATION_PRESENT

  const handleNotifyAttorney = () => {
    // In production, this would send an email
    setAttorneyNotified(true)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div 
          className="w-full max-w-[560px] rounded-lg p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
          {/* STATE 1 — No escalation */}
          {!escalation && (
            <>
              {/* Heading */}
              <h1 
                className="font-medium text-center"
                style={{ fontSize: "20px", color: "#431F5D" }}
              >
                Your NDA is ready
              </h1>
              
              {/* Subheading */}
              <p 
                className="font-normal text-center mt-2"
                style={{ fontSize: "13px", color: "#4A4A6A" }}
              >
                {"Reviewed against TECHNIA's NDA standards · Ready to send to counterparty"}
              </p>

              {/* Download Button */}
              <button
                className="w-full font-medium text-white mt-6"
                style={{
                  background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
                  borderRadius: "6px",
                  padding: "13px",
                  fontSize: "14px"
                }}
              >
                Download reviewed NDA
              </button>

              {/* Helper text */}
              <p 
                className="font-normal italic text-center mt-3"
                style={{ fontSize: "11px", color: "#4A4A6A" }}
              >
                This version is ready to send to the other party.
              </p>
            </>
          )}

          {/* STATE 2 — Escalation present */}
          {escalation && (
            <>
              {/* Heading */}
              <h1 
                className="font-medium text-center"
                style={{ fontSize: "20px", color: "#431F5D" }}
              >
                Your NDA needs one more step
              </h1>
              
              {/* Subheading */}
              <p 
                className="font-normal text-center mt-2"
                style={{ fontSize: "13px", color: "#4A4A6A" }}
              >
                One clause requires attorney review before this NDA can be sent.
              </p>

              {/* Before attorney notified */}
              {!attorneyNotified && (
                <>
                  <button
                    onClick={handleNotifyAttorney}
                    className="w-full font-medium text-white mt-6"
                    style={{
                      backgroundColor: "#431F5D",
                      borderRadius: "6px",
                      padding: "13px",
                      fontSize: "14px"
                    }}
                  >
                    Notify Counselect attorney
                  </button>

                  <div 
                    className="text-center mt-4 mx-auto"
                    style={{ maxWidth: "440px" }}
                  >
                    <p 
                      className="font-normal"
                      style={{ fontSize: "12px", color: "#4A4A6A", lineHeight: 1.8 }}
                    >
                      {"An email will be sent to your Counselect attorney. You will be cc'd."}
                    </p>
                    <p 
                      className="font-normal"
                      style={{ fontSize: "12px", color: "#4A4A6A", lineHeight: 1.8 }}
                    >
                      Expect a reviewed version within 1–2 business days that is ready to send to the other party.
                    </p>
                  </div>
                </>
              )}

              {/* After attorney notified */}
              {attorneyNotified && (
                <>
                  <button
                    disabled
                    className="w-full font-medium mt-6"
                    style={{
                      backgroundColor: "#E8F5E9",
                      color: "#1B5E20",
                      borderRadius: "6px",
                      padding: "13px",
                      fontSize: "14px",
                      cursor: "default"
                    }}
                  >
                    Attorney notified ✓
                  </button>

                  <button
                    className="w-full font-medium mt-3"
                    style={{
                      backgroundColor: "transparent",
                      color: "#431F5D",
                      border: "1px solid #431F5D",
                      borderRadius: "6px",
                      padding: "13px",
                      fontSize: "14px"
                    }}
                  >
                    Download internal draft
                  </button>

                  <p 
                    className="font-normal text-center mt-3"
                    style={{ fontSize: "11px", color: "#E65100" }}
                  >
                    Do not send this version to the other party.
                  </p>
                </>
              )}
            </>
          )}

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Feedback Section */}
          <StarRating />

          {/* Submit Another Link */}
          <div className="text-center mt-6">
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
