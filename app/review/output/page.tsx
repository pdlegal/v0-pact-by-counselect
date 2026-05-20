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

export default function ReviewOutputPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F8FA" }}>
      <NavBar />
      
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div 
          className="w-full max-w-[560px] rounded-lg p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E4E8" }}
        >
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
            {"Reviewed against TECHNIA's NDA playbook · Ready to send to counterparty"}
          </p>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div 
              className="rounded-md px-3 py-2 text-center"
              style={{ backgroundColor: "#F3EEF7" }}
            >
              <p 
                className="font-medium"
                style={{ fontSize: "13px", color: "#431F5D" }}
              >
                2 redlines applied
              </p>
            </div>
            <div 
              className="rounded-md px-3 py-2 text-center"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <p 
                className="font-medium"
                style={{ fontSize: "13px", color: "#1B5E20" }}
              >
                1 deviation accepted
              </p>
            </div>
            <div 
              className="rounded-md px-3 py-2 text-center"
              style={{ backgroundColor: "#FFF3E0" }}
            >
              <p 
                className="font-medium"
                style={{ fontSize: "13px", color: "#E65100" }}
              >
                1 declaration made
              </p>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ height: "0.5px", backgroundColor: "#E2E4E8" }}
          />

          {/* Download Button */}
          <button
            className="w-full font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #FB6A1B, #D2582F)",
              borderRadius: "6px",
              padding: "13px",
              fontSize: "14px"
            }}
          >
            Download reviewed NDA (.docx)
          </button>

          {/* Email Link */}
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

          {/* Small Print */}
          <p 
            className="font-normal"
            style={{ 
              fontSize: "11px", 
              color: "#4A4A6A",
              lineHeight: "1.6"
            }}
          >
            {"Changes reflect TECHNIA's agreed NDA positions. Items marked "}
            <span className="font-medium">Your decision</span>
            {" require approval from your team before the NDA is sent. If you have questions, contact your TECHNIA attorney."}
          </p>

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
